import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Constitution Article VI: Cross-browser testing compliance
 * Article VII: CI/CD integration support
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Timeout per test
  timeout: 60000, // 60 seconds for E2E tests

  // Maximum failures before stopping
  maxFailures: 0,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Parallelization
  workers: process.env.CI ? 1 : undefined,

  // Shared test options
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:4175',

    // Browser options
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // Output configuration
  outputDir: 'tests/e2e/results',

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e/reports', open: 'never' }],
    ['json', { outputFile: 'tests/e2e/reports/results.json' }]
  ],

  // Projects for multi-browser testing - Constitution Article VI compliance
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    },

    // Mobile device testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      }
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13']
      }
    }
  ],

  // Web server for local development
  // Commented out - start manually with `npm start` before running E2E tests
  // webServer: {
  //   command: 'node server.js',
  //   port: 4175,
  //   timeout: 120000,
  //   reuseExistingServer: !process.env.CI,
  //   stdout: 'ignore',
  //   stderr: 'pipe'
  // }
});