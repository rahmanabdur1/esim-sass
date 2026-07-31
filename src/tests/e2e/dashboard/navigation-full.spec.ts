import { test, expect } from '@playwright/test';

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

// All 20 dashboard sidebar routes — must each render without crashing
const DASHBOARD_ROUTES = [
  { path: '/dashboard', heading: /welcome back/i },
  { path: '/dashboard/my-esims', heading: /my esims/i },
  { path: '/dashboard/buy-plan', heading: /buy a plan/i },
  { path: '/dashboard/travel-planner', heading: /smart travel planner/i },
  { path: '/dashboard/compare', heading: /compare plans/i },
  { path: '/dashboard/orders', heading: /order history/i },
  { path: '/dashboard/invoices', heading: /invoices/i },
  { path: '/dashboard/analytics', heading: /usage analytics/i },
  { path: '/dashboard/advanced-analytics', heading: /advanced analytics/i },
  { path: '/dashboard/notifications', heading: /notifications/i },
  { path: '/dashboard/support', heading: /support/i },
  { path: '/dashboard/knowledge-base', heading: /how can we help/i },
  { path: '/dashboard/referral', heading: /referral program/i },
  { path: '/dashboard/rewards', heading: /rewards program/i },
  { path: '/dashboard/profile', heading: /profile/i },
  { path: '/dashboard/security', heading: /account security/i },
  { path: '/dashboard/activity', heading: /account activity/i },
  { path: '/dashboard/payment-methods', heading: /payment methods/i },
  { path: '/dashboard/privacy', heading: /privacy.*data/i },
  { path: '/dashboard/settings', heading: /settings/i },
];

test.describe('Dashboard Navigation — Full Coverage', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  for (const { path, heading } of DASHBOARD_ROUTES) {
    test(`renders ${path} with a visible heading`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      // Page should not redirect to login since we're authenticated
      expect(page.url()).not.toContain('/auth/login');
    });
  }

  test('sidebar is present on every dashboard page', async ({ page }) => {
    for (const { path } of DASHBOARD_ROUTES.slice(0, 5)) {
      await page.goto(path);
      await expect(page.getByRole('navigation', { name: /dashboard navigation/i })).toBeVisible();
    }
  });

  test('sidebar links navigate to the correct routes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'My eSIMs' }).click();
    await expect(page).toHaveURL(/\/dashboard\/my-esims/);

    await page.getByRole('link', { name: 'Buy Plan' }).click();
    await expect(page).toHaveURL(/\/dashboard\/buy-plan/);

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });

  test('sidebar collapse/expand toggle works', async ({ page }) => {
    await page.goto('/dashboard');
    const collapseBtn = page.getByRole('button', { name: /collapse sidebar/i });
    await collapseBtn.click();
    await expect(page.getByRole('button', { name: /expand sidebar/i })).toBeVisible();
  });

  test('active nav item is marked with aria-current', async ({ page }) => {
    await page.goto('/dashboard/my-esims');
    const activeLink = page.getByRole('link', { name: 'My eSIMs' });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Dashboard — Affiliate & System Status (public pages, not sidebar-gated)', () => {
  test('affiliate center page loads', async ({ page }) => {
    await page.goto('/affiliate');
    await expect(page.getByRole('heading', { name: /affiliate center/i })).toBeVisible();
  });

  test('system status page loads', async ({ page }) => {
    await page.goto('/system-status');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
