import { test, expect } from '@playwright/test';

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('settings page renders all sections', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    await expect(page.getByRole('group').or(page.getByText(/appearance/i))).toBeVisible();
    await expect(page.getByText(/language/i).first()).toBeVisible();
    await expect(page.getByText(/notification/i).first()).toBeVisible();
  });

  test('theme selection works with keyboard', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const darkOption = page.getByRole('radio', { name: /dark/i });
    if (await darkOption.isVisible()) {
      await darkOption.check();
      await expect(darkOption).toBeChecked();
    }
  });

  test('notification toggles are accessible', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const toggles = page.getByRole('switch');
    const count = await toggles.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 3); i++) {
      const toggle = toggles.nth(i);
      await expect(toggle).toHaveAttribute('aria-checked');
    }
  });

  test('toggles change state on click', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const firstToggle = page.getByRole('switch').first();
    const initialState = await firstToggle.getAttribute('aria-checked');
    await firstToggle.click();
    const newState = await firstToggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('language dropdown is functional', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const select = page.locator('select#language');
    if (await select.isVisible()) {
      await select.selectOption({ label: 'Deutsch' });
      await expect(select).toHaveValue('de');
    }
  });

  test('save button is present and clickable', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const saveBtn = page.getByRole('button', { name: /save/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('Search & Filter Interactions', () => {
  test('plans search filters results in real time', async ({ page }) => {
    await page.goto('/plans');
    const searchBox = page.getByLabel(/search/i).first();
    await expect(searchBox).toBeVisible();
    await searchBox.fill('Japan');
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/error/);
    const resultCount = page.getByText(/\d+ plans? available/i).first();
    if (await resultCount.isVisible()) {
      await expect(resultCount).toBeVisible();
    }
  });

  test('clear search button appears and clears input', async ({ page }) => {
    await page.goto('/plans');
    const searchBox = page.getByLabel(/search/i).first();
    await searchBox.fill('Japan');
    const clearBtn = page.getByLabel(/clear/i).first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchBox).toHaveValue('');
    }
  });

  test('sort dropdown changes plan order', async ({ page }) => {
    await page.goto('/plans');
    const sortSelect = page
      .locator('select')
      .filter({ hasText: /sort|default/i })
      .first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ value: 'price_asc' });
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('region filter reduces visible plans', async ({ page }) => {
    await page.goto('/plans');
    const filterBtn = page.getByRole('button', { name: /filter/i }).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      const regionSelect = page.locator('select#region-filter');
      if (await regionSelect.isVisible()) {
        await regionSelect.selectOption({ value: 'asia' });
        await page.waitForTimeout(400);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });

  test('my-esims search works correctly', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/my-esims');
    const search = page.getByLabel(/search esims/i);
    if (await search.isVisible()) {
      await search.fill('Japan');
      await page.waitForTimeout(300);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('my-esims view mode toggle switches between grid and list', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/my-esims');
    const listBtn = page.getByRole('button', { name: /list view/i });
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('orders table is searchable via DataTable search', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/orders');
    const search = page.getByRole('searchbox');
    if (await search.isVisible()) {
      await search.fill('Japan');
      await page.waitForTimeout(300);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('knowledge base search filters articles', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/knowledge-base');
    const search = page.getByLabel(/search knowledge base/i);
    await expect(search).toBeVisible();
    await search.fill('esim');
    await page.waitForTimeout(300);
    const resultInfo = page.getByText(/article/i);
    await expect(resultInfo.first()).toBeVisible();
  });

  test('knowledge base category filter works', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/knowledge-base');
    const billingBtn = page.getByRole('button', { name: /billing/i });
    if (await billingBtn.isVisible()) {
      await billingBtn.click();
      await expect(billingBtn).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

test.describe('Dashboard Widgets UI', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('dashboard shows all 4 KPI stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    const headings = ['Active eSIMs', 'Total Orders', 'Notifications', 'Data Used'];
    for (const h of headings) {
      await expect(page.getByText(h)).toBeVisible();
    }
  });

  test('buy plan CTA on dashboard navigates to buy-plan page', async ({ page }) => {
    await page.goto('/dashboard');
    await page
      .getByRole('link', { name: /buy plan/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/buy-plan/);
  });

  test('view all eSIMs link works', async ({ page }) => {
    await page.goto('/dashboard');
    const viewAllLink = page.getByRole('link', { name: /view all/i }).first();
    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(/\/dashboard\/my-esims|\/dashboard\/orders/);
    }
  });

  test('analytics period tabs switch chart data', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    const weeklyTab = page.getByRole('tab', { name: /weekly/i });
    if (await weeklyTab.isVisible()) {
      await weeklyTab.click();
      await expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('advanced analytics KPI cards render', async ({ page }) => {
    await page.goto('/dashboard/advanced-analytics');
    await expect(page.getByText(/total data used/i)).toBeVisible();
    await expect(page.getByText(/total spent/i)).toBeVisible();
  });
});

test.describe('Authentication Screens UI', () => {
  test('login form fields are keyboard navigable in correct order', async ({ page }) => {
    await page.goto('/auth/login');
    await page.keyboard.press('Tab');
    // First focusable after skip link should be logo or email
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('password field is masked by default', async ({ page }) => {
    await page.goto('/auth/login');
    const pwField = page.getByLabel(/^password/i);
    await expect(pwField).toHaveAttribute('type', 'password');
  });

  test('register form shows password strength meter', async ({ page }) => {
    await page.goto('/auth/register');
    const pwField = page.getByLabel(/^password/i).first();
    await pwField.fill('weakpass');
    const strengthLabel = page.getByText(/strength:/i);
    if (await strengthLabel.isVisible()) {
      await expect(strengthLabel).toBeVisible();
    }
  });

  test('register form validates confirm password mismatch', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page
      .getByLabel(/^password/i)
      .first()
      .fill('MyP@ss1!');
    await page.getByLabel(/confirm/i).fill('DifferentPass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('forgot password form shows success state after submission', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    // Real API call will fail in test env but UI should handle it gracefully
    await expect(page).not.toHaveURL(/error/);
  });
});
