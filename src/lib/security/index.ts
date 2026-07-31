/**
 * Enterprise Frontend Security Library
 * CSP, Trusted Types, Input Sanitization, Threat Detection
 */

// ============================================================
// 1. CONTENT SECURITY POLICY BUILDER
// ============================================================

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'frame-ancestors': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'worker-src': string[];
  'manifest-src': string[];
  'upgrade-insecure-requests': string[];
  'block-all-mixed-content': string[];
}

export function buildStrictCSP(nonce: string, isDev = false): string {
  const self = "'self'";
  const none = "'none'";

  const dirs: Partial<CSPDirectives> = {
    'default-src': [self],
    'script-src': [
      self,
      `'nonce-${nonce}'`,
      'https://js.stripe.com',
      'https://www.google.com/recaptcha/',
      'https://www.gstatic.com/recaptcha/',
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': [self, "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': [self, 'https://fonts.gstatic.com', 'data:'],
    'img-src': [self, 'data:', 'blob:', 'https:', 'https://www.google-analytics.com'],
    'connect-src': [
      self,
      process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com',
      'https://vitals.vercel-insights.com',
      'https://o0.ingest.sentry.io',
      'https://www.google-analytics.com',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-src': ['https://js.stripe.com', 'https://www.google.com/recaptcha/'],
    'frame-ancestors': [none],
    'object-src': [none],
    'base-uri': [self],
    'form-action': [self],
    'worker-src': [self, 'blob:'],
    'manifest-src': [self],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': [],
  };

  return Object.entries(dirs)
    .map(([k, v]) => (v!.length > 0 ? `${k} ${v!.join(' ')}` : k))
    .join('; ');
}

// ============================================================
// 2. INPUT SANITIZATION
// ============================================================

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/** Escape HTML special characters — use for displaying user content */
export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"'/]/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/** Strip all HTML tags — use before storing/displaying user text */
export function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

/** Remove script tags and event handlers */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/** Enforce max-length per field type */
export const INPUT_LENGTH_LIMITS = {
  name: 50,
  email: 254,
  password: 128,
  phone: 20,
  subject: 200,
  message: 5000,
  coupon: 30,
  search: 100,
  url: 2000,
  filename: 255,
  description: 10000,
} as const;

export type InputFieldType = keyof typeof INPUT_LENGTH_LIMITS;

export function enforceMaxLength(value: string, field: InputFieldType): string {
  return value.slice(0, INPUT_LENGTH_LIMITS[field]);
}

// ============================================================
// 3. FILE UPLOAD SECURITY
// ============================================================

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'sh',
  'ps1',
  'vbs',
  'js',
  'jsx',
  'ts',
  'tsx',
  'php',
  'py',
  'rb',
  'pl',
  'java',
  'class',
  'jar',
  'war',
  'dll',
  'so',
  'dylib',
  'bin',
  'msi',
  'dmg',
  'pkg',
  'deb',
  'rpm',
  'zip',
  'tar',
  'gz',
  '7z',
  'rar',
  'bz2',
]);

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings: string[];
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '_')
    .slice(0, 255);
}

export async function validateFile(file: File): Promise<FileValidationResult> {
  const warnings: string[] = [];

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit`, warnings };
  }

  // MIME type check
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed`, warnings };
  }

  // Extension check
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File extension ".${ext}" is not allowed`, warnings };
  }

  // Double-extension attack check (e.g. malware.pdf.exe)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    const allExts = parts.slice(1);
    const dangerous = allExts.some((e) => BLOCKED_EXTENSIONS.has(e.toLowerCase()));
    if (dangerous) {
      return { valid: false, error: 'File contains a suspicious double extension', warnings };
    }
  }

  // Zero-byte file
  if (file.size === 0) {
    return { valid: false, error: 'File is empty', warnings };
  }

  // Warn for unusually small PDFs (could be empty/corrupted)
  if (file.type === 'application/pdf' && file.size < 1000) {
    warnings.push('PDF file seems unusually small');
  }

  return { valid: true, warnings };
}

// ============================================================
// 4. TRUSTED TYPES POLICY
// ============================================================

export interface TrustedTypesPolicy {
  createHTML: (s: string) => string;
  createScript: (s: string) => string;
  createScriptURL: (s: string) => string;
}

/** Initialize a strict Trusted Types policy (browser-only) */
export function initTrustedTypes(): TrustedTypesPolicy | null {
  if (typeof window === 'undefined') return null;

  // Feature detection
  const win = window as typeof window & {
    trustedTypes?: {
      createPolicy: (name: string, policy: TrustedTypesPolicy) => TrustedTypesPolicy;
    };
  };

  if (!win.trustedTypes?.createPolicy) {
    console.warn('[Security] Trusted Types not supported in this browser');
    return null;
  }

  try {
    return win.trustedTypes.createPolicy('esim-platform#default', {
      createHTML: (input: string) => {
        // Only allow sanitized HTML
        const clean = sanitizeInput(stripTags(input));
        return clean;
      },
      createScript: (_input: string) => {
        // Reject all dynamic script creation
        console.warn('[Security] Dynamic script creation blocked by Trusted Types');
        return '';
      },
      createScriptURL: (input: string) => {
        // Only allow known CDNs
        const TRUSTED_ORIGINS = [
          'https://js.stripe.com',
          'https://www.google.com',
          'https://www.gstatic.com',
        ];
        const url = new URL(input);
        if (TRUSTED_ORIGINS.some((o) => input.startsWith(o))) return input;
        console.warn(`[Security] Script URL blocked: ${url.origin}`);
        return '';
      },
    });
  } catch (err) {
    console.error('[Security] Failed to create Trusted Types policy:', err);
    return null;
  }
}

// ============================================================
// 5. CLICKJACKING DETECTION
// ============================================================

/** Detect if the app is embedded in an iframe (clickjacking) */
export function detectClickjacking(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // If accessing window.top throws, we're in a sandboxed iframe
    return true;
  }
}

/** Break out of iframe (framebusting — defence-in-depth) */
export function enforceTopFrame(): void {
  if (typeof window === 'undefined') return;
  if (detectClickjacking()) {
    try {
      window.top!.location.href = window.location.href;
    } catch {
      // Can't bust out of sandboxed iframe — hide content instead
      document.documentElement.style.display = 'none';
      console.error('[Security] Clickjacking detected. Content hidden.');
    }
  }
}

// ============================================================
// 6. FRONTEND THREAT DETECTION
// ============================================================

export interface ThreatEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

type ThreatHandler = (event: ThreatEvent) => void;

const threatHandlers: ThreatHandler[] = [];

export function onThreatDetected(handler: ThreatHandler): () => void {
  threatHandlers.push(handler);
  return () => {
    const idx = threatHandlers.indexOf(handler);
    if (idx > -1) threatHandlers.splice(idx, 1);
  };
}

function emitThreat(event: ThreatEvent) {
  threatHandlers.forEach((h) => h(event));
  // Always log to console in dev
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[ThreatDetection] ${event.severity.toUpperCase()}: ${event.message}`,
      event.metadata,
    );
  }
}

/** Detect DevTools open (optional security warning) */
export function detectDevTools(onOpen: () => void): () => void {
  if (process.env.NODE_ENV !== 'production') return () => {};

  let devToolsOpen = false;

  const check = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if ((widthDiff || heightDiff) && !devToolsOpen) {
      devToolsOpen = true;
      emitThreat({
        type: 'DEVTOOLS_OPENED',
        severity: 'low',
        message: 'Developer Tools opened',
        timestamp: Date.now(),
      });
      onOpen();
    } else if (!widthDiff && !heightDiff) {
      devToolsOpen = false;
    }
  };

  const interval = setInterval(check, 1000);
  return () => clearInterval(interval);
}

/** Detect token tampering (client-side check) */
export function detectTokenTampering(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      emitThreat({
        type: 'TOKEN_MALFORMED',
        severity: 'high',
        message: 'JWT has wrong format',
        timestamp: Date.now(),
      });
      return true;
    }
    // Decode header
    const header = JSON.parse(atob(parts[0]!.replace(/-/g, '+').replace(/_/g, '/')));
    if (!header.alg || header.alg === 'none') {
      emitThreat({
        type: 'TOKEN_ALG_NONE',
        severity: 'critical',
        message: 'JWT alg:none attack detected',
        timestamp: Date.now(),
      });
      return true;
    }
    return false;
  } catch {
    emitThreat({
      type: 'TOKEN_PARSE_ERROR',
      severity: 'high',
      message: 'JWT parse failed',
      timestamp: Date.now(),
    });
    return true;
  }
}

/** Detect suspicious rapid requests (client-side abuse detection) */
export function createClientRateDetector(maxRequests: number, windowMs: number) {
  const timestamps: number[] = [];

  return function check(): boolean {
    const now = Date.now();
    const cutoff = now - windowMs;
    // Keep only timestamps within window
    while (timestamps.length > 0 && timestamps[0]! < cutoff) timestamps.shift();
    timestamps.push(now);

    if (timestamps.length > maxRequests) {
      emitThreat({
        type: 'CLIENT_RATE_EXCEEDED',
        severity: 'medium',
        message: `Client-side rate limit: ${timestamps.length} requests in ${windowMs}ms`,
        timestamp: now,
      });
      return true; // is rate limited
    }
    return false;
  };
}

// ============================================================
// 7. ENVIRONMENT VARIABLE VALIDATION
// ============================================================

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL'] as const;

export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  return { valid: missing.length === 0, missing };
}

/** Ensure no secrets are accidentally exposed client-side */
export function auditClientEnvVars(): string[] {
  const FORBIDDEN_PATTERNS = [
    /secret/i,
    /private.*key/i,
    /api.*secret/i,
    /database.*url/i,
    /db.*password/i,
    /jwt.*secret/i,
  ];

  const exposed: string[] = [];
  Object.keys(process.env)
    .filter((k) => k.startsWith('NEXT_PUBLIC_'))
    .forEach((k) => {
      if (FORBIDDEN_PATTERNS.some((re) => re.test(k))) {
        exposed.push(k);
        console.error(`[Security] Potentially sensitive key exposed client-side: ${k}`);
      }
    });
  return exposed;
}

// ============================================================
// 8. SUBRESOURCE INTEGRITY (SRI) HELPERS
// ============================================================

export interface SRIResource {
  url: string;
  integrity: string;
  crossOrigin: 'anonymous' | 'use-credentials';
}

/** Trusted third-party CDN resources with SRI hashes */
export const TRUSTED_CDN_RESOURCES: SRIResource[] = [
  // Add real SRI hashes via `npm run generate-sri` in build
];

/** Validate that external script src is in the trusted list */
export function isTrustedScriptSrc(src: string): boolean {
  const TRUSTED_ORIGINS = [
    'https://js.stripe.com',
    'https://www.google.com/recaptcha/',
    'https://www.gstatic.com/recaptcha/',
  ];
  return TRUSTED_ORIGINS.some((origin) => src.startsWith(origin));
}
