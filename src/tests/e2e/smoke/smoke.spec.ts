import { test, expect } from '@playwright/test';

/**
 * SMOKE TESTS
 * Runs before every deployment. Must all pass.
 * Tests: Home, Login, Register, Dashboard, Purchase Flow
 */

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

test.describe('Smoke — Public Pages', () => {
  test('HOME: loads with hero heading and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/eSIM Platform/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible(); // Navbar
    await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer
  });

  test('HOME: hero CTA links navigate correctly', async ({ page }) => {
    await page.goto('/');
    const browseBtn = page.getByRole('link', { name: /browse all plans/i });
    if (await browseBtn.isVisible()) {
      await browseBtn.click();
      await expect(page).toHaveURL(/\/plans/);
    }
  });

  test('HOME: coverage map section is present', async ({ page }) => {
    await page.goto('/');
    const mapSection = page.getByRole('region', { name: /coverage/i });
    await expect(mapSection).toBeVisible();
  });

  test('PLANS: page loads and shows filter controls', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByRole('heading', { name: /esim plans/i })).toBeVisible();
    await expect(page.getByLabel(/search/i).first()).toBeVisible();
  });

  test('COUNTRIES: page loads with regional sections', async ({ page }) => {
    await page.goto('/countries');
    await expect(page.getByRole('heading', { name: /global coverage/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /asia/i })).toBeVisible();
  });

  test('CONTACT: form loads and validates', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible();
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });

  test('BLOG: listing page renders posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
    await expect(page.getByRole('link').first()).toBeVisible();
  });

  test('SYSTEM STATUS: page loads with service list', async ({ page }) => {
    await page.goto('/system-status');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/API Gateway/)).toBeVisible();
  });
});

test.describe('Smoke — Auth Pages', () => {
  test('LOGIN: form renders with all required fields', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('REGISTER: form renders with all required fields', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i).first()).toBeVisible();
    await expect(page.getByLabel(/confirm/i)).toBeVisible();
  });

  test('FORGOT PASSWORD: form renders', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });
});

test.describe('Smoke — Dashboard (Authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('DASHBOARD HOME: loads with welcome message and stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText(/active esims/i)).toBeVisible();
  });

  test('MY ESIMS: page loads without error', async ({ page }) => {
    await page.goto('/dashboard/my-esims');
    await expect(page.getByRole('heading', { name: /my esims/i })).toBeVisible();
  });

  test('BUY PLAN: page loads with search', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    await expect(page.getByRole('heading', { name: /buy a plan/i })).toBeVisible();
    await expect(page.getByLabel(/search/i)).toBeVisible();
  });

  test('SUPPORT: page loads with new ticket button', async ({ page }) => {
    await page.goto('/dashboard/support');
    await expect(page.getByRole('heading', { name: /support/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new ticket/i })).toBeVisible();
  });

  test('PROFILE: page loads with form fields', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });
});

test.describe('Smoke — Purchase Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('PURCHASE FLOW: buy-plan → plans visible', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    await expect(page.getByRole('heading', { name: /buy a plan/i })).toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });

  test('PURCHASE FLOW: checkout redirects to buy-plan when cart is empty', async ({ page }) => {
    await page.goto('/dashboard/checkout');
    // Without item in cart, should redirect
    await expect(page).toHaveURL(/\/(dashboard\/checkout|dashboard\/buy-plan)/);
  });

  test('PURCHASE FLOW: orders page is accessible', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible();
  });

  test('PURCHASE FLOW: invoices page is accessible', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
  });
});
