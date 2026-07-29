import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:             './src/tests/e2e',
  fullyParallel:       true,
  forbidOnly:          !!process.env.CI,
  retries:             process.env.CI ? 2 : 0,
  workers:             process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],
  use: {
    baseURL:            process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace:              'on-first-retry',
    screenshot:         'only-on-failure',
    video:              'on-first-retry',
    actionTimeout:      15_000,
    navigationTimeout:  30_000,
    // Simulate realistic user agent
    userAgent:          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
  projects: [
    // ── Desktop browsers ──────────────────────────────────────
    {
      name:    'chromium',
      use:     { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name:    'firefox',
      use:     { ...devices['Desktop Firefox'] },
    },
    {
      name:    'webkit',
      use:     { ...devices['Desktop Safari'] },
    },
    // ── Mobile browsers ───────────────────────────────────────
    {
      name:    'mobile-chrome',
      use:     { ...devices['Pixel 7'] },
    },
    {
      name:    'mobile-safari',
      use:     { ...devices['iPhone 15'] },
    },
    // ── Accessibility (axe) ───────────────────────────────────
    {
      name:    'accessibility',
      use:     { ...devices['Desktop Chrome'] },
      testMatch: '**/accessibility/**/*.spec.ts',
    },
    // ── Visual regression ─────────────────────────────────────
    {
      name:    'visual',
      use:     { ...devices['Desktop Chrome'] },
      testMatch: '**/visual/**/*.spec.ts',
    },
  ],
  webServer: {
    command:            'pnpm start',
    url:                'http://localhost:3000',
    reuseExistingServer:!process.env.CI,
    timeout:            120_000,
  },
  outputDir:           'test-results',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
});
