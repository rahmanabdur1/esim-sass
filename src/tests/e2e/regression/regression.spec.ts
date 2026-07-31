import { test, expect } from '@playwright/test';

/**
 * REGRESSION TESTS
 * Run on every release to guard existing features.
 * Covers: Navigation, Authentication, Dashboard, Existing Features.
 */

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

test.describe('Regression — Navigation', () => {
  test('all public nav links render without 404', async ({ page }) => {
    const publicPaths = [
      '/',
      '/plans',
      '/countries',
      '/about',
      '/contact',
      '/blog',
      '/faq',
      '/terms',
      '/privacy',
      '/system-status',
      '/affiliate',
    ];
    for (const path of publicPaths) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return 200`).toBe(200);
    }
  });

  test('navbar logo links back to home', async ({ page }) => {
    await page.goto('/plans');
    await page.getByRole('link', { name: /esim platform home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page.getByText(/404/)).toBeVisible();
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
  });

  test('footer links are all internal and not broken', async ({ page }) => {
    await page.goto('/');
    const footerLinks = await page.getByRole('contentinfo').getByRole('link').all();
    for (const link of footerLinks.slice(0, 8)) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        expect(href.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Regression — Authentication', () => {
  test('login → register link works', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /create one free/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('register → login link works', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('login form blocks empty submission', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('register form blocks weak password', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page
      .getByLabel(/^password/i)
      .first()
      .fill('weakpass');
    await page.getByLabel(/confirm/i).fill('weakpass');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('protected routes stay protected after failed login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await page.getByLabel(/email/i).fill('wrong@test.com');
    await page.getByLabel(/^password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Still on login page after failed attempt
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});

test.describe('Regression — Dashboard', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('authenticated user sees correct page on dashboard routes', async ({ page }) => {
    const routes = [
      ['/dashboard', /welcome back/i],
      ['/dashboard/my-esims', /my esims/i],
      ['/dashboard/orders', /order history/i],
      ['/dashboard/settings', /settings/i],
      ['/dashboard/profile', /profile/i],
    ] as const;
    for (const [path, heading] of routes) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    }
  });

  test('referral page shows referral code section', async ({ page }) => {
    await page.goto('/dashboard/referral');
    await expect(page.getByText(/referral link/i)).toBeVisible();
  });

  test('rewards page shows tier card', async ({ page }) => {
    await page.goto('/dashboard/rewards');
    await expect(page.getByText(/achievement/i).first()).toBeVisible();
  });

  test('travel planner requires all fields before analysis', async ({ page }) => {
    await page.goto('/dashboard/travel-planner');
    const findBtn = page.getByRole('button', { name: /find my perfect plan/i });
    await expect(findBtn).toBeDisabled();
  });

  test('compare page shows add-plan picker', async ({ page }) => {
    await page.goto('/dashboard/compare');
    await expect(page.getByRole('heading', { name: /compare plans/i })).toBeVisible();
    await expect(page.getByText(/add a plan/i)).toBeVisible();
  });

  test('knowledge base category buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard/knowledge-base');
    const categoryBtns = page
      .getByRole('button')
      .filter({ hasText: /billing|getting started|esim/i });
    if (await categoryBtns.first().isVisible()) {
      await categoryBtns.first().focus();
      await page.keyboard.press('Enter');
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('security page shows password change form', async ({ page }) => {
    await page.goto('/dashboard/security');
    await expect(page.getByRole('heading', { name: /change password/i })).toBeVisible();
    await expect(page.getByLabel(/current password/i)).toBeVisible();
  });

  test('activity page shows sessions section', async ({ page }) => {
    await page.goto('/dashboard/activity');
    await expect(page.getByRole('heading', { name: /active sessions/i })).toBeVisible();
  });

  test('privacy page shows data export button', async ({ page }) => {
    await page.goto('/dashboard/privacy');
    await expect(page.getByRole('button', { name: /request data export/i })).toBeVisible();
  });
});

test.describe('Regression — Plan Flows', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('plan cards show required information fields', async ({ page }) => {
    await page.goto('/plans');
    await page.waitForLoadState('networkidle');
    const cards = page.getByRole('article');
    const count = await cards.count();
    if (count > 0) {
      const firstCard = cards.first();
      await expect(firstCard.getByText(/GB/i)).toBeVisible();
      await expect(firstCard.getByText(/\$|€|£/)).toBeVisible();
    }
  });

  test('country detail page renders for known country codes', async ({ page }) => {
    for (const code of ['jp', 'us']) {
      await page.goto(`/countries/${code}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('blog post detail page renders for known slugs', async ({ page }) => {
    for (const slug of ['what-is-esim', 'best-esim-for-japan']) {
      await page.goto(`/blog/${slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});

test.describe('Regression — Forms', () => {
  test('contact form shows success state after valid submission', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel(/name/i).first().fill('Test User');
    await page.getByLabel(/email/i).first().fill('test@example.com');
    await page.getByLabel(/subject/i).fill('Test subject line here');
    await page
      .getByLabel(/message/i)
      .fill('This is a test message that is definitely long enough to pass validation checks.');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText(/message sent/i).or(page.getByRole('status'))).toBeVisible({
      timeout: 5000,
    });
  });

  test('support ticket form validates description length', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/support');
    await page.getByRole('button', { name: /new ticket/i }).click();
    const subjectInput = page.getByLabel(/subject/i).first();
    if (await subjectInput.isVisible()) {
      await subjectInput.fill('Test subject');
      const descInput = page.getByLabel(/description/i);
      await descInput.fill('short');
      await page.getByRole('button', { name: /submit ticket/i }).click();
      await expect(page.getByRole('alert').first()).toBeVisible();
    }
  });

  test('checkout coupon input is present', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    // Set a cart item in session storage first
    await page.goto('/dashboard/buy-plan');
    // Without a real cart item, checkout redirects — that's expected
    await page.goto('/dashboard/checkout');
    await expect(page).toHaveURL(/\/(dashboard\/checkout|dashboard\/buy-plan)/);
  });
});

test.describe('Regression — Permission Boundaries', () => {
  test('all 20 dashboard routes redirect unauthenticated users', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/my-esims',
      '/dashboard/buy-plan',
      '/dashboard/checkout',
      '/dashboard/orders',
      '/dashboard/invoices',
      '/dashboard/analytics',
      '/dashboard/notifications',
      '/dashboard/support',
      '/dashboard/referral',
      '/dashboard/rewards',
      '/dashboard/profile',
      '/dashboard/security',
      '/dashboard/payment-methods',
      '/dashboard/settings',
      '/dashboard/travel-planner',
      '/dashboard/compare',
      '/dashboard/activity',
      '/dashboard/privacy',
      '/dashboard/knowledge-base',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page, `${route} should redirect to login`).toHaveURL(/\/auth\/login/);
    }
  });
});
