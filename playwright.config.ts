import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const basePath = '/diogo.martins/';
/** Specs about small touch screens, which only the mobile projects run. */
const mobileOnly = /mobile\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The JSON report feeds the results on the /quality page (see .github/workflows/ci.yml).
  reporter: process.env.CI
    ? [
        ['html', { open: 'never' }],
        ['github'],
        ['json', { outputFile: process.env.E2E_REPORT_FILE ?? 'reports/e2e.json' }],
      ]
    : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? `http://localhost:${port}${basePath}`,
    trace: 'on-first-retry',
  },
  // CI runs each browser in its own job (see .github/workflows/ci.yml) via --project. The mobile
  // projects run in the job of the engine they emulate, so CI installs each browser only once.
  // Firefox has no mobile emulation in Playwright, so phones are covered by Chromium and WebKit.
  projects: [
    { name: 'chromium', testIgnore: mobileOnly, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: mobileOnly, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: mobileOnly, use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  ],
  // Tests run against the production build. Set BASE_URL to test a deployed site instead.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run preview -- --port ${port} --ignore-lock`,
        url: `http://localhost:${port}${basePath}`,
        reuseExistingServer: !process.env.CI,
      },
});
