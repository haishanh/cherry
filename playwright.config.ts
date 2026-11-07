import { defineConfig, devices } from '@playwright/test';

const port = process.env.CHERRY_E2E_PORT || '4187';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [[process.env.CI ? 'line' : 'list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    extraHTTPHeaders: { 'x-forwarded-proto': 'http' },
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], colorScheme: 'light' } },
  ],
  webServer: {
    command: 'node scripts/start-e2e-server.mjs',
    url: `${baseURL}/signin`,
    reuseExistingServer: false,
    timeout: 30_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
});
