import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // In CI, start the Next.js dev server before running tests.
  // Locally we usually run dev in docker-compose, so reuse the existing one.
  webServer: process.env.CI
    ? {
        command: "npm run dev",
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: false,
      }
    : undefined,
});
