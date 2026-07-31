import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('renders login page correctly', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('validates empty form submission', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('validates invalid email', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email address/i).fill('notanemail');
    await page.getByLabel(/^password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email address/i).fill('demo@esimplatform.com');
    await page.getByLabel(/^password/i).fill('Demo1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test('callbackUrl redirect after login', async ({ page }) => {
    await page.goto('/auth/login?callbackUrl=/dashboard/my-esims');
    await page.getByLabel(/email address/i).fill('demo@esimplatform.com');
    await page.getByLabel(/^password/i).fill('Demo1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/my-esims/, { timeout: 5000 });
  });

  test('password show/hide toggle', async ({ page }) => {
    await page.goto('/auth/login');
    const pw = page.getByLabel(/^password/i);
    await expect(pw).toHaveAttribute('type', 'password');
    await page.getByLabel(/show password/i).click();
    await expect(pw).toHaveAttribute('type', 'text');
  });

  test('forgot password link navigates', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });
});

test.describe('Register Flow', () => {
  test('renders all register fields', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i).first()).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('shows password strength meter', async ({ page }) => {
    await page.goto('/auth/register');
    await page
      .getByLabel(/^password/i)
      .first()
      .fill('weak');
    await expect(page.getByText(/strength:/i)).toBeVisible();
  });

  test('validates password mismatch', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page
      .getByLabel(/^password/i)
      .first()
      .fill('MyPass123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('successful registration redirects to verify-email with email param', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel(/full name/i).fill('New User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page
      .getByLabel(/^password/i)
      .first()
      .fill('ValidPass123!');
    await page.getByLabel(/confirm password/i).fill('ValidPass123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/auth\/verify-email.*email=/, { timeout: 5000 });
  });
});

test.describe('Verify Email Flow', () => {
  test('shows inbox check state', async ({ page }) => {
    await page.goto('/auth/verify-email?email=user%40example.com');
    await expect(page.getByRole('heading', { name: /check your inbox/i })).toBeVisible();
    await expect(page.getByText(/user@example\.com/)).toBeVisible();
  });

  test('resend sends and shows confirmation', async ({ page }) => {
    await page.goto('/auth/verify-email?email=user%40example.com');
    await page.getByRole('button', { name: /resend/i }).click();
    await expect(page.getByText(/email resent|new email sent/i)).toBeVisible({ timeout: 3000 });
  });

  test('success state with valid token', async ({ page }) => {
    await page.goto('/auth/verify-email?token=mock_valid_token_123');
    await expect(page.getByRole('heading', { name: /email verified/i })).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
  });
});

test.describe('Forgot & Reset Password Flow', () => {
  test('forgot password - validates empty email', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('forgot password - success shows email confirmation', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.getByLabel(/email address/i).fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 3000 });
  });

  test('reset password - shows error without token', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await expect(page.getByText(/invalid link/i)).toBeVisible();
  });

  test('reset password - successful reset shows success', async ({ page }) => {
    await page.goto('/auth/reset-password?token=mock_reset_token');
    await page.getByLabel(/^password/i).fill('NewPass123!');
    await page.getByLabel(/confirm/i).fill('NewPass123!');
    await page.getByRole('button', { name: /reset password/i }).click();
    await expect(page.getByText(/password updated/i)).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Session Guard', () => {
  test('unauthenticated user redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('authenticated user redirected from login to dashboard', async ({ page, context }) => {
    await context.addCookies([
      { name: 'esim_access_token', value: 'mock_token_test', domain: 'localhost', path: '/' },
    ]);
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
