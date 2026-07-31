import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/eSIM Platform/);
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('plans page is accessible', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByRole('heading', { name: /esim plans/i })).toBeVisible();
  });

  test('countries page is accessible', async ({ page }) => {
    await page.goto('/countries');
    await expect(page.getByRole('heading', { name: /global coverage/i })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible();
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('home page has skip-to-main link target', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
  });

  test('login page has proper form labels', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
  });
});

test.describe('Middleware Redirects', () => {
  test('dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('login page redirects authenticated users to dashboard', async ({ page, context }) => {
    // Simulate auth cookie
    await context.addCookies([
      {
        name: 'esim_access_token',
        // A real but expired JWT — middleware reads the exp claim
        value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.fake',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
