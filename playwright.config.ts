import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const basePath = '/diogo.martins/';
/** Specs about small touch screens, which only the mobile projects run. */
const mobileOnly = /mobile\.spec\.ts$/;
/** Screenshot comparisons, which only Chromium on a desktop and on a phone run. */
const visual = /visual\.spec\.ts$/;
/**
 * The screenshots match the build under test, not the live site (whose /quality page shows real
 * CI results), so the smoke test against BASE_URL leaves them out.
 */
const liveIgnore = process.env.BASE_URL ? [visual] : [];

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
  // One baseline per project, without the platform suffix: CI and `npm run test:visual:update`
  // both render them on Linux in the same Playwright image.
  snapshotPathTemplate: 'e2e/__screenshots__/{projectName}/{arg}{ext}',
  // CI runs each browser in its own job (see .github/workflows/ci.yml) via --project. The mobile
  // projects run in the job of the engine they emulate, so CI installs each browser only once.
  // Firefox has no mobile emulation in Playwright, so phones are covered by Chromium and WebKit.
  projects: [
    {
      name: 'chromium',
      testIgnore: [mobileOnly, ...liveIgnore],
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'firefox', testIgnore: [mobileOnly, visual], use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: [mobileOnly, visual], use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', testIgnore: liveIgnore, use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', testIgnore: visual, use: { ...devices['iPhone 15'] } },
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
