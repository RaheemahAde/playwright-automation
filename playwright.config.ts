import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Path to the directory where tests are located
  timeout: 5000, // Maximum time one test can run (30 seconds)
  expect: {
    timeout: 5000, // Timeout for assertions (e.g., expect)
  },
  //reporter: [['html']],
  use: {
    testIdAttribute: 'data-test',
    headless: true, // Run tests in headless mode
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium'},
    },
  ],
});
