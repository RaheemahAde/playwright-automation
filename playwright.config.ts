import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Path to the directory where tests are located
  timeout: 30000, // Maximum time one test can run (30 seconds)
  expect: {
    timeout: 5000, // Timeout for assertions (e.g., expect)
  },
  retries: 2, // Number of retries for failed tests
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 }, // Default browser viewport size
    actionTimeout: 0, // No limit for actions like page.click
    ignoreHTTPSErrors: true, // Ignore HTTPS errors
    video: 'on-first-retry', // Record video only on first retry of a test
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }, // Run tests in Chromium
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }, // Run tests in Firefox
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }, // Run tests in WebKit
    },
  ],
});
