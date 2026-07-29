import { test, expect } from '@playwright/test';

/**
 * VISUAL REGRESSION TESTS
 * Uses Playwright's built-in screenshot comparison.
 * For CI: integrate with Chromatic (Storybook) or Percy.
 *
 * Run: npx playwright test --update-snapshots  (to create baseline)
 * Run: npx playwright test                     (to compare against baseline)
 */

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost', path: '/',
};

// Shared screenshot options
const SNAP_OPTS = {
  animations: 'disabled' as const,
  mask: [
    // Mask dynamic content that changes every run
  ],
};

test.describe('Visual Regression — Public Pages', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('home page — desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Mask the hero section gradient which may vary by timing
    await expect(page).toHaveScreenshot('home-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('plans page — desktop', async ({ page }) => {
    await page.goto('/plans');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('plans-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('about page — desktop', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('about-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });
});

test.describe('Visual Regression — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('home page — mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-mobile.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('login page — mobile', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-mobile.png', {
      ...SNAP_OPTS,
      maxDiffPixelRatio: 0.03,
    });
  });
});

test.describe('Visual Regression — Auth Pages', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('login page — desktop', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-desktop.png', {
      ...SNAP_OPTS,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('register page — desktop', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('register-desktop.png', {
      ...SNAP_OPTS,
      maxDiffPixelRatio: 0.03,
    });
  });
});

test.describe('Visual Regression — Dashboard', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('dashboard home — desktop', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Wait for any skeleton loaders to resolve
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard-home-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.08,
    });
  });

  test('my esims page — desktop', async ({ page }) => {
    await page.goto('/dashboard/my-esims');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('my-esims-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.08,
    });
  });

  test('settings page — desktop', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('settings-desktop.png', {
      ...SNAP_OPTS,
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe('Visual Regression — Component States', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('login form validation error state', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('form', { name: /login form/i })).toHaveScreenshot(
      'login-validation-errors.png',
      { ...SNAP_OPTS, maxDiffPixelRatio: 0.03 }
    );
  });

  test('mobile menu open state', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.getByRole('button', { name: /open menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByRole('banner')).toHaveScreenshot(
        'navbar-mobile-menu-open.png',
        { ...SNAP_OPTS, maxDiffPixelRatio: 0.03 }
      );
    }
  });
});
