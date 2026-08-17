// Info: Playwright E2E configuration. Builds the web host and serves the
// production bundle via vite preview, then runs browser interaction tests
// against all app shapes.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173',
    cwd: 'hosts/web',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});
