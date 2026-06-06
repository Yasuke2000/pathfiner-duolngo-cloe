import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end config. The smoke test auto-plays the whole course in a real
 * browser — the one thing the unit tests can't do — to catch runtime/UI bugs
 * like a combat that never ends.
 *
 * Browsers must be installed once: `npx playwright install chromium`.
 * Run with: `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 300_000, // a full playthrough plays every fight to completion
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
