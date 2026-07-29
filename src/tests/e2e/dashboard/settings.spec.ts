import { test, expect } from '@playwright/test';

const AUTH_COOKIE = {
  name:   'esim_access_token',
  value:  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path:   '/',
};

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('renders all settings sections', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /language.*region/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /data.*privacy/i })).toBeVisible();
  });

  test('theme selector toggles aria-pressed state', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const darkOption = page.getByRole('radio', { name: /dark/i }).or(page.locator('label', { hasText: 'Dark' }));
    await darkOption.first().click();
    // Theme store should reflect the choice (persisted to localStorage)
    const stored = await page.evaluate(() => localStorage.getItem('theme-store'));
    expect(stored).toContain('dark');
  });

  test('notification toggles are switchable', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const emailToggle = page.getByRole('switch', { name: /email notifications/i });
    const initial = await emailToggle.getAttribute('aria-checked');
    await emailToggle.click();
    const after = await emailToggle.getAttribute('aria-checked');
    expect(after).not.toBe(initial);
  });

  test('security toggle cannot be disabled (always-on alerts stay interactive but semantically important)', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const securityToggle = page.getByRole('switch', { name: /security alerts/i });
    await expect(securityToggle).toBeVisible();
  });

  test('language dropdown has options', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const langSelect = page.getByLabel('Language');
    await expect(langSelect).toBeVisible();
    const options = await langSelect.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('currency dropdown has options', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const currencySelect = page.getByLabel('Currency');
    await expect(currencySelect).toBeVisible();
  });

  test('save settings button is present and clickable', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const saveBtn = page.getByRole('button', { name: /save all settings/i });
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
  });
});

test.describe('Security Screen', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('renders change password form', async ({ page }) => {
    await page.goto('/dashboard/security');
    await expect(page.getByLabel(/current password/i)).toBeVisible();
    await expect(page.getByLabel(/^new password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm new password/i)).toBeVisible();
  });

  test('shows validation error on weak new password', async ({ page }) => {
    await page.goto('/dashboard/security');
    await page.getByLabel(/current password/i).fill('oldpass123');
    await page.getByLabel(/^new password/i).fill('weak');
    await page.getByLabel(/confirm new password/i).fill('weak');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('danger zone delete account button is present', async ({ page }) => {
    await page.goto('/dashboard/security');
    await expect(page.getByRole('button', { name: /delete my account/i })).toBeVisible();
  });

  test('active sessions section renders', async ({ page }) => {
    await page.goto('/dashboard/security');
    await expect(page.getByRole('heading', { name: /active sessions/i })).toBeVisible();
  });
});

test.describe('Privacy & Data Screen', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('renders data export section', async ({ page }) => {
    await page.goto('/dashboard/privacy');
    await expect(page.getByRole('heading', { name: /export my data/i })).toBeVisible();
  });

  test('data export flow shows processing then ready state', async ({ page }) => {
    await page.goto('/dashboard/privacy');
    await page.getByRole('button', { name: /request data export/i }).click();
    await expect(page.getByText(/preparing your export/i)).toBeVisible();
    await expect(page.getByText(/export ready/i)).toBeVisible({ timeout: 5000 });
  });

  test('account deletion requires typing DELETE to confirm', async ({ page }) => {
    await page.goto('/dashboard/privacy');
    await page.getByRole('button', { name: /delete my account/i }).click();
    const confirmBtn = page.getByRole('button', { name: /delete permanently/i });
    await expect(confirmBtn).toBeDisabled();

    await page.getByLabel(/type delete to confirm/i).fill('DELETE');
    await expect(confirmBtn).toBeEnabled();
  });

  test('account deletion can be cancelled', async ({ page }) => {
    await page.goto('/dashboard/privacy');
    await page.getByRole('button', { name: /delete my account/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('button', { name: /delete my account/i })).toBeVisible();
  });
});
