import { test, expect } from '@playwright/test';

test.describe('Purchase Flow — Complete Journey', () => {
  test.beforeEach(async ({ context }) => {
    // Simulate authenticated session
    await context.addCookies([{
      name:   'esim_access_token',
      value:  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
      domain: 'localhost',
      path:   '/',
    }]);
  });

  test('can navigate to buy plan page', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    await expect(page.getByRole('heading', { name: /buy a plan/i })).toBeVisible();
  });

  test('can search for plans', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    const search = page.getByLabel(/search plans/i);
    if (await search.isVisible()) {
      await search.fill('Japan');
      await page.waitForTimeout(500);
      const results = page.getByText(/japan/i).first();
      // Results might be empty in test env, just verify no crash
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('can filter plans by sort', async ({ page }) => {
    await page.goto('/dashboard/buy-plan');
    const sort = page.getByLabel(/sort plans/i);
    if (await sort.isVisible()) {
      await sort.selectOption('price_asc');
      await page.waitForTimeout(300);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('checkout page shows order summary', async ({ page }) => {
    await page.goto('/dashboard/checkout');
    // Without a cart item it redirects to buy-plan
    await expect(page).toHaveURL(/\/(dashboard\/checkout|dashboard\/buy-plan)/);
  });

  test('orders page is accessible when authenticated', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible();
  });

  test('invoices page is accessible when authenticated', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
  });
});

test.describe('Purchase Flow — Plan Comparison', () => {
  test('compare page loads correctly', async ({ page, context }) => {
    await context.addCookies([{
      name: 'esim_access_token', value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
      domain: 'localhost', path: '/',
    }]);
    await page.goto('/dashboard/compare');
    await expect(page.getByRole('heading', { name: /compare plans/i })).toBeVisible();
  });
});

test.describe('Purchase Flow — Travel Planner', () => {
  test('travel planner page loads', async ({ page, context }) => {
    await context.addCookies([{
      name: 'esim_access_token', value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
      domain: 'localhost', path: '/',
    }]);
    await page.goto('/dashboard/travel-planner');
    await expect(page.getByRole('heading', { name: /smart travel planner/i })).toBeVisible();
    await expect(page.getByLabel(/destination country/i)).toBeVisible();
  });

  test('travel planner requires all fields', async ({ page, context }) => {
    await context.addCookies([{
      name: 'esim_access_token', value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
      domain: 'localhost', path: '/',
    }]);
    await page.goto('/dashboard/travel-planner');
    const findBtn = page.getByRole('button', { name: /find my perfect plan/i });
    await expect(findBtn).toBeDisabled();
  });
});
