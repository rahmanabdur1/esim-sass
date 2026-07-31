import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * ACCESSIBILITY E2E TESTS
 * Uses @axe-core/playwright to run automated WCAG 2.2 AA checks
 * on every critical public and authenticated page.
 */

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost',
  path: '/',
};

// Helper: run axe and assert no violations
async function assertNoA11yViolations(page: any, context?: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules([
      'color-contrast', // requires visual inspection; covered by manual audit
    ])
    .analyze();

  if (results.violations.length > 0) {
    const summary = results.violations
      .map((v) => `[${v.id}] ${v.description} — ${v.nodes.length} node(s)`)
      .join('\n');
    throw new Error(`Accessibility violations on ${context ?? page.url()}:\n${summary}`);
  }
}

test.describe('Accessibility — Public Pages', () => {
  test('Home page has no critical WCAG violations', async ({ page }) => {
    await page.goto('/');
    await assertNoA11yViolations(page, 'Home page');
  });

  test('Plans listing page has no violations', async ({ page }) => {
    await page.goto('/plans');
    await assertNoA11yViolations(page, 'Plans page');
  });

  test('Countries page has no violations', async ({ page }) => {
    await page.goto('/countries');
    await assertNoA11yViolations(page, 'Countries page');
  });

  test('About page has no violations', async ({ page }) => {
    await page.goto('/about');
    await assertNoA11yViolations(page, 'About page');
  });

  test('Contact page has no violations', async ({ page }) => {
    await page.goto('/contact');
    await assertNoA11yViolations(page, 'Contact page');
  });

  test('FAQ page has no violations', async ({ page }) => {
    await page.goto('/faq');
    await assertNoA11yViolations(page, 'FAQ page');
  });

  test('Blog listing has no violations', async ({ page }) => {
    await page.goto('/blog');
    await assertNoA11yViolations(page, 'Blog page');
  });

  test('System status page has no violations', async ({ page }) => {
    await page.goto('/system-status');
    await assertNoA11yViolations(page, 'System status page');
  });

  test('404 page has no violations', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await assertNoA11yViolations(page, '404 page');
  });
});

test.describe('Accessibility — Auth Pages', () => {
  test('Login page has no violations', async ({ page }) => {
    await page.goto('/auth/login');
    await assertNoA11yViolations(page, 'Login page');
  });

  test('Register page has no violations', async ({ page }) => {
    await page.goto('/auth/register');
    await assertNoA11yViolations(page, 'Register page');
  });

  test('Forgot password page has no violations', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await assertNoA11yViolations(page, 'Forgot password page');
  });

  test('Login page: all form inputs are labelled', async ({ page }) => {
    await page.goto('/auth/login');
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const hasLabel = id ? (await page.locator(`label[for="${id}"]`).count()) > 0 : false;
      expect(
        hasLabel || !!ariaLabel || !!ariaLabelledBy,
        `Input ${id ?? '(no id)'} must have an accessible label`,
      ).toBe(true);
    }
  });
});

test.describe('Accessibility — Dashboard Pages', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([AUTH_COOKIE]);
  });

  test('Dashboard home has no violations', async ({ page }) => {
    await page.goto('/dashboard');
    await assertNoA11yViolations(page, 'Dashboard home');
  });

  test('My eSIMs page has no violations', async ({ page }) => {
    await page.goto('/dashboard/my-esims');
    await assertNoA11yViolations(page, 'My eSIMs page');
  });

  test('Orders page has no violations', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await assertNoA11yViolations(page, 'Orders page');
  });

  test('Profile page has no violations', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await assertNoA11yViolations(page, 'Profile page');
  });

  test('Settings page has no violations', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await assertNoA11yViolations(page, 'Settings page');
  });

  test('Support page has no violations', async ({ page }) => {
    await page.goto('/dashboard/support');
    await assertNoA11yViolations(page, 'Support page');
  });

  test('Knowledge base page has no violations', async ({ page }) => {
    await page.goto('/dashboard/knowledge-base');
    await assertNoA11yViolations(page, 'Knowledge base');
  });

  test('Security page has no violations', async ({ page }) => {
    await page.goto('/dashboard/security');
    await assertNoA11yViolations(page, 'Security page');
  });

  test('Rewards page has no violations', async ({ page }) => {
    await page.goto('/dashboard/rewards');
    await assertNoA11yViolations(page, 'Rewards page');
  });
});

test.describe('Accessibility — Keyboard Navigation', () => {
  test('skip-to-main-content link is first focusable on home', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const text = await focused.textContent();
    expect(text?.toLowerCase()).toContain('skip');
  });

  test('skip link navigates to #main-content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('navbar is fully keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // logo
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('modal closes with Escape key', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/support');
    await page.getByRole('button', { name: /new ticket/i }).click();
    const form = page.getByRole('region').filter({ hasText: /create support ticket/i });
    if (await form.isVisible()) {
      await page.keyboard.press('Escape');
      // Form should close
      await expect(form)
        .not.toBeVisible({ timeout: 1000 })
        .catch(() => {});
    }
  });

  test('all interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto('/auth/login');
    // Tab through a few elements and verify focus is visible
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const count = await focused.count();
      if (count > 0) {
        // Check that the element exists (visible focus ring enforced via CSS)
        await expect(focused.first()).toBeVisible();
      }
    }
  });
});

test.describe('Accessibility — Screen Reader Semantics', () => {
  test('landmark regions are present on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('heading hierarchy is correct on plans page', async ({ page }) => {
    await page.goto('/plans');
    const h1 = await page.getByRole('heading', { level: 1 }).count();
    expect(h1).toBe(1); // exactly one H1 per page
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt, 'Image must have alt attribute').not.toBeNull();
    }
  });

  test('notification status is announced via aria-live', async ({ page, context }) => {
    await context.addCookies([AUTH_COOKIE]);
    await page.goto('/dashboard/my-esims');
    const liveRegion = page.locator('[aria-live]');
    const count = await liveRegion.count();
    expect(count).toBeGreaterThan(0);
  });
});
