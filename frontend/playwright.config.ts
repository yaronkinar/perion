import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['json', { outputFile: 'playwright-report.json' }],
        ['html', { open: 'never' }],
      ]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: process.env.CI ? 'on' : 'only-on-failure',
    video: process.env.CI
      ? { mode: 'on', size: { width: 1280, height: 720 } }
      : { mode: 'retain-on-failure', size: { width: 1280, height: 720 } },
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
