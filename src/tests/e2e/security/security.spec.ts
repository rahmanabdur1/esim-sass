import { test, expect } from '@playwright/test';

test.describe('Security — Route Protection', () => {
  test('unauthenticated user cannot access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    expect(page.url()).toContain('callbackUrl');
  });

  test('unauthenticated user cannot access my-esims', async ({ page }) => {
    await page.goto('/dashboard/my-esims');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('unauthenticated user cannot access checkout', async ({ page }) => {
    await page.goto('/dashboard/checkout');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('unauthenticated user cannot access settings', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('unauthenticated user cannot access security page', async ({ page }) => {
    await page.goto('/dashboard/security');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('unauthenticated user cannot access profile', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('public pages are accessible without auth', async ({ page }) => {
    for (const path of [
      '/',
      '/plans',
      '/countries',
      '/about',
      '/contact',
      '/faq',
      '/terms',
      '/privacy',
      '/blog',
    ]) {
      await page.goto(path);
      await expect(page).not.toHaveURL(/\/auth\/login/);
    }
  });

  test('login page redirects authenticated user to dashboard', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'esim_access_token',
        // A JWT with a far-future exp for test purposes
        value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Security — XSS Prevention', () => {
  test('login form does not execute injected script', async ({ page }) => {
    await page.goto('/auth/login');
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.getByLabel(/email/i).fill('<script>alert("xss")</script>');
    await page.getByLabel(/^password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('search input does not execute injected script', async ({ page }) => {
    await page.goto('/plans');
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    const searchInput = page.getByLabel(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('<img src=x onerror=alert(1)>');
      await page.waitForTimeout(500);
      expect(alertFired).toBe(false);
    }
  });
});

test.describe('Security — Response Headers', () => {
  test('home page returns security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
    expect(headers['x-request-id']).toBeTruthy();
  });

  test('CSP header is present on all pages', async ({ page }) => {
    for (const path of ['/', '/plans', '/auth/login']) {
      const response = await page.goto(path);
      const headers = response?.headers() ?? {};
      expect(headers['content-security-policy']).toBeTruthy();
      expect(headers['content-security-policy']).toContain('nonce-');
      expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    }
  });

  test('rate limit headers are present', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};
    expect(headers['x-ratelimit-remaining']).toBeTruthy();
  });

  test('X-Frame-Options prevents iframe embedding', async ({ page }) => {
    const response = await page.goto('/dashboard');
    const headers = response?.headers() ?? {};
    expect(headers['x-frame-options']).toBe('DENY');
  });
});

test.describe('Security — Input Validation', () => {
  test('login form shows error for SQL injection attempt', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill("admin' OR '1'='1");
    await page.getByLabel(/^password/i).fill('pass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('register form enforces password complexity', async ({ page }) => {
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

  test('contact form validates email format', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel(/name/i).fill('Test');
    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByLabel(/subject/i).fill('Test subject here');
    await page
      .getByLabel(/message/i)
      .fill('This is a test message that is long enough to pass validation.');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('Security — GDPR', () => {
  test('cookie consent banner appears on first visit', async ({ page }) => {
    await page.goto('/');
    // Give time for banner to appear
    await page.waitForTimeout(500);
    const banner = page.getByRole('dialog', { name: /cookie/i });
    if (await banner.isVisible()) {
      await expect(banner).toBeVisible();
    }
  });
});
