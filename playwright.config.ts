import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Covers critical user journeys for production readiness validation
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you can't access a local app */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Workers on CI - use 1 to avoid race conditions */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    /* Collect trace when a test fails */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording */
    video: 'on-first-retry',
  },

  /* Configure projects */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/auth-state.json',
      },
    },
  ],

  /* Global setup to generate auth state */
  globalSetup: process.env.CI || process.env.E2E_AUTH ? require.resolve('./e2e/global-setup.ts') : undefined,

  /* Web server configuration for CI */
  webServer: process.env.CI
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      }
    : undefined,

  /* Timeout settings */
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
});