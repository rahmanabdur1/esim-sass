/**
 * MOCK API HANDLER — 100% coverage, no backend needed
 * ====================================================
 * Intercepts ALL axios requests and returns realistic mock data.
 * Enable: NEXT_PUBLIC_USE_MOCK_API=true in .env.local
 */
import type { AxiosInstance } from 'axios';
import {
  MOCK_USER, MOCK_PLANS, MOCK_COUNTRIES, MOCK_ESIMS,
  MOCK_ORDERS, MOCK_NOTIFICATIONS, MOCK_TICKETS,
  MOCK_PAYMENT_METHODS, MOCK_ANALYTICS, MOCK_REFERRAL,
  MOCK_REWARDS, MOCK_BLOG_POSTS, MOCK_ARTICLES,
} from './data';
import type { SupportTicket, PaymentMethod } from '@/types';

// Simulate realistic network delay (120–400ms)
const delay = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 280));

// Wrap response in the shape services expect
const ok = <T>(data: T, meta?: { total?: number; page?: number; limit?: number }) => ({
  data: {
    success: true,
    data: meta ? { data, total: meta.total ?? 0, page: meta.page ?? 1, limit: meta.limit ?? 50 } : data,
    message: 'OK',
  },
  status: 200,
});

const fail = (message: string, status = 400) => ({
  data: { success: false, message },
  status,
});

async function mockRoute(
  method: string,
  url: string,
  body?: unknown,
): Promise<{ data: unknown; status: number } | null> {
  await delay();

  const m = method.toUpperCase();
  const u = url.replace(/^\//, '').split('?')[0] ?? ''; // strip leading slash + query

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (m === 'POST' && u === 'auth/login') {
    const { email = '', password = '' } = (body as Record<string, string>) ?? {};
    const validDemo = email === 'demo@esimplatform.com' && password === 'Demo1234!';
    const validAny  = email.includes('@') && password.length >= 8;
    if (!validDemo && !validAny) return fail('Invalid email or password.', 401);
    return ok({ user: { ...MOCK_USER, email }, token: `mock_jwt_${Date.now()}`, refreshToken: `mock_refresh_${Date.now()}` });
  }

  if (m === 'POST' && u === 'auth/register') {
    const { name = 'New User', email = '', password = '' } = (body as Record<string, string>) ?? {};
    // Simulate duplicate email detection (real backend returns 409)
    if (email === 'taken@example.com' || email === 'existing@test.com') {
      return fail('An account with this email already exists.', 409);
    }
    if (!email.includes('@') || password.length < 8) {
      return fail('Invalid email or password too short.', 400);
    }
    return ok({
      user:         { ...MOCK_USER, name, email },
      token:        `mock_jwt_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
    });
  }

  if (m === 'POST'  && u === 'auth/logout')               return ok({ success: true });
  if (m === 'POST'  && u === 'auth/forgot-password')      return ok({ message: 'Reset link sent to your email.' });
  if (m === 'POST'  && u === 'auth/reset-password')       return ok({ message: 'Password reset successfully.' });
  if (m === 'POST'  && u === 'auth/verify-email')         return ok({ message: 'Email verified successfully.' });
  if (m === 'POST'  && u === 'auth/resend-verification')  return ok({ message: 'Verification email resent.' });
  if (m === 'GET'   && u === 'auth/me')                   return ok(MOCK_USER);
  if (m === 'POST'  && u === 'auth/refresh')              return ok({ accessToken: `mock_jwt_${Date.now()}` });

  // ── PLANS ─────────────────────────────────────────────────────────────────
  if (m === 'GET' && u === 'plans/featured')
    return ok(MOCK_PLANS.filter((p) => p.isPopular).slice(0, 4));

  if (m === 'GET' && u.startsWith('plans/country/')) {
    const code = u.split('/')[2]?.toUpperCase() ?? '';
    const plans = MOCK_PLANS.filter((p) => p.country.code === code);
    return ok(plans, { total: plans.length });
  }

  if (m === 'GET' && u.match(/^plans\/[^/]+$/)) {
    const id   = u.split('/')[1];
    const plan = MOCK_PLANS.find((p) => p.id === id);
    return plan ? ok(plan) : fail('Plan not found', 404);
  }

  if (m === 'GET' && u.startsWith('plans'))
    return ok(MOCK_PLANS, { total: MOCK_PLANS.length });

  // ── COUNTRIES ─────────────────────────────────────────────────────────────
  if (m === 'GET' && u === 'countries/featured')
    return ok(MOCK_COUNTRIES.slice(0, 8));

  if (m === 'GET' && u.match(/^countries\/[^/]+$/)) {
    const id = u.split('/')[1]?.toLowerCase() ?? '';
    const c  = MOCK_COUNTRIES.find((c) => c.id === id || c.code.toLowerCase() === id);
    return c ? ok(c) : fail('Country not found', 404);
  }

  if (m === 'GET' && u.startsWith('countries'))
    return ok(MOCK_COUNTRIES, { total: MOCK_COUNTRIES.length });

  // ── ESIMs ─────────────────────────────────────────────────────────────────
  if (m === 'GET' && u.match(/^esims\/[^/]+\/qrcode$/)) {
    const id = u.split('/')[1];
    const e  = MOCK_ESIMS.find((e) => e.id === id);
    return ok({ qrCode: e?.qrCode ?? '' });
  }

  if (m === 'POST' && u.match(/^esims\/[^/]+\/activate$/)) {
    const id = u.split('/')[1];
    const e  = MOCK_ESIMS.find((e) => e.id === id);
    return e ? ok({ ...e, status: 'active' }) : fail('eSIM not found', 404);
  }

  if (m === 'GET' && u.match(/^esims\/[^/]+$/)) {
    const id = u.split('/')[1];
    const e  = MOCK_ESIMS.find((e) => e.id === id);
    return e ? ok(e) : fail('eSIM not found', 404);
  }

  if (m === 'GET' && u.startsWith('esims'))
    return ok(MOCK_ESIMS, { total: MOCK_ESIMS.length });

  // ── ORDERS ────────────────────────────────────────────────────────────────
  if (m === 'POST' && u === 'orders') {
    const b       = (body as Record<string, string>) ?? {};
    const planId  = b['planId'] ?? 'plan-jp-2';
    const plan    = MOCK_PLANS.find((p) => p.id === planId) ?? MOCK_PLANS[1]!;
    const newOrder = {
      id:            `ord-${Date.now()}`,
      orderNumber:   `ESM-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      status:        'completed' as const,
      totalAmount:   plan.price,
      currency:      'USD',
      plan,
      esim:          MOCK_ESIMS[0]!,
      paymentMethod: MOCK_PAYMENT_METHODS[0]!,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    };
    return ok(newOrder);
  }

  if (m === 'GET' && u.match(/^orders\/[^/]+$/)) {
    const id = u.split('/')[1];
    const o  = MOCK_ORDERS.find((o) => o.id === id);
    return o ? ok(o) : fail('Order not found', 404);
  }

  if (m === 'GET' && u.startsWith('orders'))
    return ok(MOCK_ORDERS, { total: MOCK_ORDERS.length });

  // ── INVOICES ──────────────────────────────────────────────────────────────
  if (m === 'GET' && u.match(/^invoices\/[^/]+\/download$/)) {
    // Return a mock PDF blob URL
    return ok({ downloadUrl: '#mock-invoice-download', expiresAt: new Date(Date.now() + 3600000).toISOString() });
  }

  if (m === 'GET' && u.startsWith('invoices'))
    return ok(
      MOCK_ORDERS.filter((o) => o.status === 'completed'),
      { total: MOCK_ORDERS.filter((o) => o.status === 'completed').length }
    );

  // ── COUPONS ───────────────────────────────────────────────────────────────
  if ((m === 'POST' && u === 'coupons/apply') || (m === 'POST' && u === 'coupons/validate')) {
    const b    = (body as Record<string, string>) ?? {};
    const code = (b['couponCode'] ?? '').toUpperCase();
    const valid: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      'WELCOME15': { discount: 1.35, type: 'percentage' },
      'SAVE10':    { discount: 0.90, type: 'percentage' },
      'FLAT5':     { discount: 5.00, type: 'fixed'      },
      'NEWUSER':   { discount: 2.00, type: 'fixed'      },
    };
    return valid[code]
      ? ok({ ...valid[code], code, finalPrice: 8.99 - (valid[code]?.discount ?? 0) })
      : fail('Invalid or expired coupon code.', 400);
  }

  // ── USER / PROFILE ────────────────────────────────────────────────────────
  if (m === 'GET'   && (u === 'user/profile' || u === 'users/me'))
    return ok(MOCK_USER);

  if (m === 'PATCH' && (u === 'user/profile' || u === 'users/me'))
    return ok({ ...MOCK_USER, ...(body as object) });

  if (m === 'POST'  && u === 'user/avatar')
    return ok({ ...MOCK_USER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock' });

  if (m === 'POST'  && u === 'user/change-password')
    return ok({ message: 'Password changed successfully.' });

  if (m === 'PUT'   && u === 'users/me/password')
    return ok({ message: 'Password updated successfully.' });

  if (m === 'DELETE' && (u === 'user/account' || u === 'users/me/delete'))
    return ok({ message: 'Account deletion scheduled. Your data will be removed within 30 days.' });

  if (m === 'GET'   && u === 'users/me/export')
    return ok({ downloadUrl: '#mock-export-download', expiresAt: new Date(Date.now() + 3600000).toISOString() });

  if (m === 'GET'   && u === 'users/me/sessions')
    return ok([
      { id: 's1', device: 'MacBook Pro',  browser: 'Chrome 120', os: 'macOS 14',  location: 'San Francisco, US', ip: '192.168.1.1', lastActive: new Date(Date.now() - 5 * 60000).toISOString(), current: true },
      { id: 's2', device: 'iPhone 15',    browser: 'Safari 17',  os: 'iOS 17',    location: 'New York, US',      ip: '10.0.0.5',   lastActive: new Date(Date.now() - 2 * 3600000).toISOString(), current: false },
    ]);

  if (m === 'DELETE' && u.match(/^users\/me\/sessions\//))
    return ok({ success: true });

  if (m === 'GET' && u === 'users/me/activity')
    return ok([
      { id: '1', type: 'login',           description: 'Successful login',            ip: '192.168.1.1',   location: 'San Francisco, US', browser: 'Chrome 120', os: 'macOS',   timestamp: new Date(Date.now() - 5  * 60000).toISOString(),  success: true  },
      { id: '2', type: 'settings_change', description: 'Email notifications updated', ip: '192.168.1.1',   location: 'San Francisco, US', browser: 'Chrome 120', os: 'macOS',   timestamp: new Date(Date.now() - 30 * 60000).toISOString(),  success: true  },
      { id: '3', type: 'login',           description: 'Successful login',            ip: '10.0.0.5',      location: 'New York, US',      browser: 'Safari 17',  os: 'iOS 17',  timestamp: new Date(Date.now() - 2  * 3600000).toISOString(), success: true  },
      { id: '4', type: 'login',           description: 'Failed login attempt',        ip: '185.220.101.5', location: 'Amsterdam, NL',     browser: 'Unknown',    os: 'Unknown', timestamp: new Date(Date.now() - 5  * 3600000).toISOString(), success: false },
      { id: '5', type: 'password_change', description: 'Password changed',            ip: '192.168.1.1',   location: 'San Francisco, US', browser: 'Chrome 120', os: 'macOS',   timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), success: true  },
      { id: '6', type: 'security_alert',  description: 'New device logged in',        ip: '172.16.0.3',    location: 'London, UK',        browser: 'Firefox 121',os: 'Windows', timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), success: true  },
    ]);

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  if (m === 'GET'   && u.startsWith('user/notifications'))
    return ok(MOCK_NOTIFICATIONS, { total: MOCK_NOTIFICATIONS.length });

  if (m === 'PATCH' && u.match(/^user\/notifications\/[^/]+\/read$/))
    return ok({ success: true });

  if (m === 'PATCH' && u === 'user/notifications/read-all')
    return ok({ success: true });

  if (m === 'GET'   && u.startsWith('notifications'))
    return ok(MOCK_NOTIFICATIONS, { total: MOCK_NOTIFICATIONS.length });

  if (m === 'PATCH' && u.match(/^notifications\/[^/]+\/read$/))
    return ok({ success: true });

  if (m === 'POST'  && u === 'notifications/read-all')
    return ok({ success: true });

  // ── SUPPORT TICKETS ───────────────────────────────────────────────────────
  if (m === 'POST' && (u === 'user/tickets' || u === 'support/tickets')) {
    const b = (body as Record<string, string>) ?? {};
    const ticket: SupportTicket = {
      id:           `tkt-${Date.now()}`,
      ticketNumber: `TKT-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      subject:      b['subject']     ?? 'New ticket',
      description:  b['description'] ?? '',
      status:       'open',
      priority:     (b['priority'] as SupportTicket['priority']) ?? 'medium',
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
      messages:     [{
        id:        'm-new',
        sender:    'user',
        content:   b['description'] ?? '',
        createdAt: new Date().toISOString(),
      }],
    };
    return ok(ticket);
  }

  if (m === 'GET' && (u.startsWith('user/tickets') || u.startsWith('support')))
    return ok(MOCK_TICKETS, { total: MOCK_TICKETS.length });

  // ── PAYMENT METHODS ───────────────────────────────────────────────────────
  if (m === 'GET'    && u === 'user/payment-methods')
    return ok(MOCK_PAYMENT_METHODS);

  if (m === 'POST'   && u === 'user/payment-methods') {
    const pm: PaymentMethod = {
      id:          `pm-${Date.now()}`,
      type:        'card',
      last4:       '4242',
      brand:       'Visa',
      label:       'Visa ending 4242',
      expiryMonth: 12,
      expiryYear:  2028,
      isDefault:   false,
    };
    return ok(pm);
  }

  if (m === 'DELETE' && u.match(/^user\/payment-methods\/[^/]+$/))
    return ok({ success: true });

  if (m === 'PATCH'  && u.match(/^user\/payment-methods\/[^/]+\/default$/))
    return ok({ success: true });

  // Also handle the /payment-methods route (without /user/ prefix)
  if (m === 'GET'    && u.startsWith('payment-methods'))
    return ok(MOCK_PAYMENT_METHODS);

  if (m === 'POST'   && u === 'payment-methods') {
    const pm: PaymentMethod = { id: `pm-${Date.now()}`, type: 'card', last4: '4242', brand: 'Visa', label: 'Visa ending 4242', expiryMonth: 12, expiryYear: 2028, isDefault: false };
    return ok(pm);
  }

  if (m === 'DELETE' && u.match(/^payment-methods\/[^/]+$/))
    return ok({ success: true });

  if (m === 'PATCH'  && u.match(/^payment-methods\/[^/]+\/default$/))
    return ok({ success: true });

  // ── ANALYTICS ─────────────────────────────────────────────────────────────
  if (m === 'GET' && (u.startsWith('user/analytics') || u.startsWith('analytics')))
    return ok(MOCK_ANALYTICS);

  // ── REFERRAL ──────────────────────────────────────────────────────────────
  if (m === 'GET'  && (u === 'user/referral' || u.startsWith('referral')))
    return ok(MOCK_REFERRAL);

  if (m === 'POST' && u === 'user/referral/send')
    return ok({ message: 'Referral invitation sent!' });

  // ── REWARDS ───────────────────────────────────────────────────────────────
  if (m === 'GET'  && (u === 'user/rewards' || u.startsWith('rewards')))
    return ok(MOCK_REWARDS);

  if (m === 'POST' && u === 'user/rewards/redeem')
    return ok({ message: 'Reward redeemed successfully!', pointsUsed: 500, discount: 5 });

  // ── KNOWLEDGE BASE ────────────────────────────────────────────────────────
  if (m === 'GET' && u === 'knowledge-base/articles')
    return ok(MOCK_ARTICLES, { total: MOCK_ARTICLES.length });

  if (m === 'GET' && u.match(/^knowledge-base\/articles\/[^/]+$/)) {
    const id  = u.split('/')[2];
    const art = MOCK_ARTICLES.find((a) => a.id === id);
    return art ? ok(art) : fail('Article not found', 404);
  }

  if (m === 'POST' && u.match(/^knowledge-base\/articles\/[^/]+\/helpful$/))
    return ok({ success: true });

  // ── BLOG ──────────────────────────────────────────────────────────────────
  if (m === 'GET' && u.match(/^blog\/[^/]+$/)) {
    const slug = u.split('/')[1];
    const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);
    return post ? ok(post) : fail('Post not found', 404);
  }

  if (m === 'GET' && u.startsWith('blog'))
    return ok(MOCK_BLOG_POSTS, { total: MOCK_BLOG_POSTS.length });

  // ── NEWSLETTER ────────────────────────────────────────────────────────────
  if (m === 'POST' && u === 'newsletter/subscribe')
    return ok({ message: 'Successfully subscribed to newsletter!' });

  // ── SETTINGS ─────────────────────────────────────────────────────────────
  if (m === 'PATCH' && u === 'user/settings')
    return ok({ ...MOCK_USER, ...(body as object) });

  if (m === 'GET'   && u === 'user/settings')
    return ok({
      emailNotifications: true, pushNotifications: true, smsNotifications: false,
      marketingEmails: true, securityAlerts: true, dataUsageAlerts: true,
      language: 'en', currency: 'USD', theme: 'system', timezone: 'UTC',
    });

  // ── SYSTEM STATUS ─────────────────────────────────────────────────────────
  if (m === 'GET' && u === 'system/status')
    return ok({
      status:     'operational',
      lastUpdated: new Date().toISOString(),
      services: [
        { name: 'API Gateway',      status: 'operational', uptime: 99.99 },
        { name: 'eSIM Activation',  status: 'operational', uptime: 99.97 },
        { name: 'Payment Gateway',  status: 'operational', uptime: 99.95 },
        { name: 'CDN',              status: 'operational', uptime: 100   },
        { name: 'Authentication',   status: 'operational', uptime: 99.98 },
      ],
    });

  // ── CONTACT FORM ──────────────────────────────────────────────────────────
  if (m === 'POST' && u === 'contact')
    return ok({ message: 'Message received! We will reply within 24 hours.' });

  // No mock match → fall through to real API (returns null)
  return null;
}

// ── Install interceptor on the axios instance ─────────────────────────────
export function installMockInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const useMock =
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ||
      (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV !== 'production');

    if (!useMock) return config;

    const method = config.method ?? 'GET';
    const url    = (config.url ?? '').replace(/^\//, '');
    const body   = config.data
      ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data)
      : undefined;

    const result = await mockRoute(method, url, body);
    if (!result) return config; // Fall through to real API

    // Short-circuit the HTTP request and return mock data directly
    config.adapter = async () => ({
      data:       result.data,
      status:     result.status,
      statusText: result.status < 400 ? 'OK' : 'Error',
      headers:    { 'content-type': 'application/json', 'x-mock': 'true' },
      config,
    });

    return config;
  });
}
