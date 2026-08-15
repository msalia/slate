import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: 'list',
  retries: 0,
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
