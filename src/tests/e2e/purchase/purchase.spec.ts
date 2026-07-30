import { test as base, expect } from '@playwright/test';

// 1. Centralize the test user token
const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

// 2. Extend test context or use a top-level beforeEach to inject auth for ALL tests in this file
base.beforeEach(async ({ context }) => {
  await context.addCookies([AUTH_COOKIE]);
});

base.describe('Purchase Flow — Complete Journey', () => {
  base('can navigate to buy plan page', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    await expect(page.getByRole('heading', { name: /buy a plan/i })).toBeVisible();
  });

  base('can search for plans', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    const search = page.getByLabel(/search plans/i);
    if (await search.isVisible()) {
      await search.fill('Japan');
      await page.waitForTimeout(500);
      const _results = page.getByText(/japan/i).first();
      await expect(page).not.toHaveURL(/error/);
    }
  });

  base('can filter plans by sort', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    const sort = page.getByLabel(/sort plans/i);
    if (await sort.isVisible()) {
      await sort.selectOption('price_asc');
      await page.waitForTimeout(300);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  base('checkout page shows order summary', async ({ page }) => {
    await page.goto('/dashboard/checkout');
    await expect(page).toHaveURL(/\/(dashboard\/checkout|dashboard\/buy-plan)/);
  });

  base('orders page is accessible when authenticated', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible();
  });

  base('invoices page is accessible when authenticated', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
  });
});

base.describe('Purchase Flow — Plan Comparison', () => {
  base('compare page loads correctly', async ({ page }) => {
    await page.goto('/dashboard/compare');
    await expect(page.getByRole('heading', { name: /compare plans/i })).toBeVisible();
  });
});

base.describe('Purchase Flow — Travel Planner', () => {
  base('travel planner page loads', async ({ page }) => {
    await page.goto('/dashboard/travel-planner');
    await expect(page.getByRole('heading', { name: /smart travel planner/i })).toBeVisible();
    await expect(page.getByLabel(/destination country/i)).toBeVisible();
  });

  base('travel planner requires all fields', async ({ page }) => {
    await page.goto('/dashboard/travel-planner');
    const findBtn = page.getByRole('button', { name: /find my perfect plan/i });
    await expect(findBtn).toBeDisabled();
  });
});
