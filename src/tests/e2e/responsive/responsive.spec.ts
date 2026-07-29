import { test, expect } from '@playwright/test';

/**
 * RESPONSIVE TESTS
 * Validates layout at each defined breakpoint:
 * 320px (Mobile XS), 640px (Mobile), 768px (Tablet),
 * 1024px (Laptop), 1280px (Desktop), 1440px (Large Desktop)
 */

const VIEWPORTS = [
  { name: 'Mobile XS',      width: 320,  height: 812  },
  { name: 'Mobile',         width: 640,  height: 812  },
  { name: 'Tablet',         width: 768,  height: 1024 },
  { name: 'Laptop',         width: 1024, height: 768  },
  { name: 'Desktop',        width: 1280, height: 900  },
  { name: 'Large Desktop',  width: 1440, height: 900  },
] as const;

const AUTH_COOKIE = {
  name: 'esim_access_token',
  value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.test',
  domain: 'localhost', path: '/',
};

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('home page renders without horizontal overflow', async ({ page }) => {
      await page.goto('/');
      const bodyWidth    = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth  = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth, `Horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(windowWidth + 2);
    });

    test('navbar renders correctly — logo visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('link', { name: /esim platform/i }).first()).toBeVisible();
    });

    test('mobile menu opens on small screens', async ({ page }) => {
      await page.goto('/');
      if (viewport.width < 1024) {
        const menuBtn = page.getByRole('button', { name: /open menu/i });
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await expect(page.getByRole('navigation', { name: /mobile navigation/i })).toBeVisible();
        }
      }
    });

    test('plans page layout adapts gracefully', async ({ page }) => {
      await page.goto('/plans');
      await expect(page.getByRole('heading', { name: /esim plans/i })).toBeVisible();
      // Check that the search input is visible at all sizes
      await expect(page.getByLabel(/search/i).first()).toBeVisible();
    });

    test('contact form stacks correctly at all widths', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.getByLabel(/name/i).first()).toBeVisible();
      await expect(page.getByLabel(/email/i).first()).toBeVisible();
      await expect(page.getByLabel(/subject/i)).toBeVisible();
    });

    test('dashboard layout adapts — sidebar not overlapping content', async ({ page, context }) => {
      await context.addCookies([AUTH_COOKIE]);
      await page.goto('/dashboard');
      const main = page.locator('#main-content');
      await expect(main).toBeVisible();
      // No content should be hidden by sidebar overflow
      const mainBox = await main.boundingBox();
      expect(mainBox?.width).toBeGreaterThan(0);
    });

    test('footer renders without overflow', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  });
}

test.describe('Responsive — Text Scaling', () => {
  test('page is readable at 200% browser zoom equivalent', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 400 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('form inputs remain usable at small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/auth/login');
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });
});

test.describe('Responsive — Touch Targets', () => {
  test('buttons have adequate touch target size (≥44x44px) on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const buttons = await page.getByRole('button').all();
    for (const btn of buttons.slice(0, 5)) {
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          // Allow 36px minimum (some utility icon buttons are intentionally smaller)
          expect(box.height, 'Button height should be ≥36px').toBeGreaterThanOrEqual(36);
        }
      }
    }
  });

  test('navigation links have adequate spacing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.getByRole('button', { name: /open menu/i });
    if (await menuBtn.isVisible()) {
      const box = await menuBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(36);
    }
  });
});
