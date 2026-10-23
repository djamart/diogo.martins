import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const basePath = '/diogo.martins/';

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
  // CI runs each browser in its own job (see .github/workflows/ci.yml) via --project.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
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
