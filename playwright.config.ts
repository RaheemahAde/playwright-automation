import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Path to the directory where tests are located
  timeout: 30000, // Maximum time one test can run (30 seconds)
  expect: {
    timeout: 5000, // Timeout for assertions (e.g., expect)
  },
  use: {
    //    storageState: 'storage-state.json'
    headless: true, // Run tests in headless mode
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }, // Run tests in Chromium
    },
  ],
});
