// Info: Playwright E2E configuration. Builds the web host and serves the
// production bundle via vite preview, then runs browser interaction tests
// against all app shapes. The perf project is separate: it runs serially
// with CPU throttling to collect deterministic build-count and timing
// measurements against a budget. The visual project is serial, Chromium
// only, with deterministic display settings; its spec file is created in
// Part F after final visuals are produced.
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
      testIgnore: ['e2e/perf/**', 'e2e/visual/**'],
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'perf',
      testDir: './e2e/perf',
      testMatch: /.*\.perf\.js$/,
      fullyParallel: false,
      workers: 1,
      retries: 0,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'visual',
      testDir: './e2e/visual',
      fullyParallel: false,
      workers: 1,
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'UTC',
        deviceScaleFactor: 1
      }
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
