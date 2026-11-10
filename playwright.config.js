import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'runtime/e2e',
  testMatch: '*.spec.js',
  webServer: {
    command: 'npm run build && node runtime/e2e/serve.mjs',
    url: 'http://localhost:4173/examples/basic/',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1920, height: 1080 },
  },
});
