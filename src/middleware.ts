import { type NextRequest, NextResponse } from 'next/server';

// ============================================================
// CONFIGURATION
// ============================================================

// const PUBLIC_PATHS = new Set([
//   '/', '/plans', '/about', '/contact', '/blog', '/faq', '/terms', '/privacy',
//   '/system-status', '/affiliate', '/sitemap.xml', '/robots.txt',
// ]);

// Prefixes that are always public (dynamic routes)
// const PUBLIC_PREFIXES = [
//   '/countries/', '/blog/', '/plans/', '/og', '/api/health',
// ];

const AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]);

const PROTECTED_PREFIXES = ['/dashboard'];
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|otf|css|js|map)$/i;

// ============================================================
// RATE LIMITING  (edge-compatible Map — use Upstash Redis in prod)
// ============================================================
interface RLEntry {
  count: number;
  windowStart: number;
}
const rlStore = new Map<string, RLEntry>();

const LIMITS = {
  auth: { window: 15 * 60_000, max: 10 },
  api: { window: 60_000, max: 100 },
  default: { window: 60_000, max: 200 },
} as const;
type LimitType = keyof typeof LIMITS;

function checkRL(ip: string, type: LimitType) {
  const cfg = LIMITS[type];
  const key = `${type}:${ip}`;
  const now = Date.now();
  const e = rlStore.get(key);
  if (!e || now - e.windowStart > cfg.window) {
    rlStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: cfg.max - 1, resetAt: now + cfg.window };
  }
  if (e.count >= cfg.max)
    return { allowed: false, remaining: 0, resetAt: e.windowStart + cfg.window };
  e.count++;
  return { allowed: true, remaining: cfg.max - e.count, resetAt: e.windowStart + cfg.window };
}

function evict() {
  const now = Date.now();
  for (const [key, e] of rlStore) {
    const type = key.split(':')[0] as LimitType;
    if (now - e.windowStart > (LIMITS[type]?.window ?? 60_000)) rlStore.delete(key);
  }
}

// ============================================================
// SECURITY HEADERS
// ============================================================
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function genNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => CHARS[b % CHARS.length])
    .join('');
}

function buildCSP(nonce: string, dev: boolean): string {
  const self = "'self'";
  const none = "'none'";
  const dirs: Record<string, string[]> = {
    'default-src': [self],
    'script-src': [
      self,
      `'nonce-${nonce}'`,
      'https://js.stripe.com',
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': [self, "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': [self, 'https://fonts.gstatic.com'],
    'img-src': [self, 'data:', 'blob:', 'https:'],
    'connect-src': [
      self,
      process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com',
      ...(dev ? ['ws://localhost:*'] : []),
    ],
    'frame-src': ['https://js.stripe.com'],
    'frame-ancestors': [none],
    'object-src': [none],
    'base-uri': [self],
    'form-action': [self],
    'worker-src': [self, 'blob:'],
    'upgrade-insecure-requests': [],
  };
  return Object.entries(dirs)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

function applyHeaders(res: NextResponse, nonce: string, dev: boolean) {
  res.headers.set('Content-Security-Policy', buildCSP(nonce, dev));
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  res.headers.set('X-Nonce', nonce);
  if (!dev) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}

// ============================================================
// HELPERS
// ============================================================
function getIP(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'
  );
}

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('esim_access_token')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function isExpired(token: string): boolean {
  // ── Mock token (dev mode) — always valid ──────────────────
  // Mock tokens are prefixed 'mock_' — not real JWTs.
  // Real JWTs have 3 dot-separated parts: header.payload.signature
  if (token.startsWith('mock_')) return false;

  // ── Real JWT expiry check ─────────────────────────────────
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = payload?.exp as number | undefined;
    if (!exp) return false; // No exp claim → treat as valid
    return Date.now() / 1000 > exp - 30; // 30s buffer before real expiry
  } catch {
    return true;
  }
}

function sanitizePath(p: string): string {
  return p.replace(/\/{2,}/g, '/').replace(/\.\./g, '');
}

type LogLevel = 'info' | 'warn' | 'error';
function log(level: LogLevel, msg: string, meta: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    const payload = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...meta });
    if (level === 'error') console.error(payload);
    else if (level === 'warn') console.warn(payload);
    else console.info(payload);
  } else {
    const icon = { info: '✅', warn: '⚠️', error: '❌' }[level];
    const output = `[MW] ${icon} ${msg}`;
    if (level === 'error') console.error(output, meta);
    else if (level === 'warn') console.warn(output, meta);
    else console.info(output, meta);
  }
}

function rateLimitResponse(resetAt: number): NextResponse {
  const retry = Math.ceil((resetAt - Date.now()) / 1000);
  return new NextResponse(
    JSON.stringify({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests.',
      retryAfter: retry,
    }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retry) } },
  );
}

// ============================================================
// MAIN MIDDLEWARE
// ============================================================
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const dev = process.env.NODE_ENV === 'development';
  const ip = getIP(req);
  const method = req.method;
  const t0 = Date.now();

  // 1 ── Skip static assets
  if (pathname.startsWith('/_next/') || STATIC_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  // 2 ── Path sanitization — block traversal attacks
  const safe = sanitizePath(pathname);
  if (safe !== pathname) {
    log('warn', 'Path traversal blocked', { ip, pathname });
    return new NextResponse(null, { status: 400 });
  }

  // 3 ── HTTP method allowlist
  const ALLOWED = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
  if (!ALLOWED.has(method)) {
    log('warn', 'Method not allowed', { ip, method, pathname });
    return new NextResponse(null, { status: 405, headers: { Allow: [...ALLOWED].join(', ') } });
  }

  // 4 ── Suspicious User-Agent blocking
  const ua = req.headers.get('user-agent') ?? '';
  const BAD_UA = [/sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /zgrab/i, /dirbuster/i, /burpsuite/i];
  if (BAD_UA.some((re) => re.test(ua))) {
    log('warn', 'Bad UA blocked', { ip, ua: ua.slice(0, 80), pathname });
    return new NextResponse(null, { status: 403 });
  }

  // 5 ── Rate limiting
  evict();
  const isAuthPath = AUTH_PATHS.has(pathname);
  const limitType: LimitType = isAuthPath ? 'auth' : 'default';
  const rl = checkRL(ip, limitType);
  if (!rl.allowed) {
    log('warn', 'Rate limited', { ip, pathname, limitType });
    return rateLimitResponse(rl.resetAt);
  }

  // 6 ── Authentication + authorization
  const token = getToken(req);
  const loggedIn = !!token && !isExpired(token);
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const onAuthPage = AUTH_PATHS.has(pathname);

  // 6a — Protect dashboard routes
  if (needsAuth && !loggedIn) {
    log('info', 'Unauth → login redirect', { ip, pathname });
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('callbackUrl', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete('esim_access_token');
    res.cookies.delete('esim_refresh_token');
    return res;
  }

  // 6b — Redirect logged-in users away from auth pages
  // Exception: /auth/verify-email is needed even after login (just registered)
  if (onAuthPage && loggedIn && pathname !== '/auth/verify-email') {
    log('info', 'Auth user → dashboard', { ip, pathname });
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 7 ── CSRF guard for mutating requests
  const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (MUTATING.has(method) && !isAuthPath) {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://esimplatform.com';
    const trusted =
      origin?.startsWith(appUrl) || referer?.startsWith(appUrl) || (!origin && !referer);
    if (!trusted) {
      log('warn', 'CSRF blocked', { ip, origin, referer, pathname, method });
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Cross-origin request blocked' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // 8 ── Build response + apply security headers
  const nonce = genNonce();
  const res = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers.entries()),
        'x-nonce': nonce,
        'x-pathname': pathname,
        'x-ip': ip,
      }),
    },
  });

  applyHeaders(res, nonce, dev);

  // 9 ── Rate-limit info headers
  res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  res.headers.set('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)));

  // 10 ── Distributed tracing ID
  const reqId = crypto.randomUUID();
  res.headers.set('X-Request-Id', reqId);

  // 11 ── Access log
  log('info', 'Request', {
    reqId,
    ip,
    method,
    pathname,
    loggedIn,
    ms: Date.now() - t0,
    rlRemaining: rl.remaining,
  });

  return res;
}

// ============================================================
// MATCHER
// ============================================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
