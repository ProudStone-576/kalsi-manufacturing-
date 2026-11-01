import { defineConfig, devices } from "@playwright/test";

const PORT = 3401;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Installed Google Chrome; set PW_CHANNEL=chromium to use Playwright's bundled browser instead.
    channel: process.env.PW_CHANNEL ?? "chrome",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL ?? "chrome" } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: process.env.PW_CHANNEL ?? "chrome" },
      // API and security checks are viewport-independent; run them once.
      testIgnore: /api\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      MAIL_TRANSPORT: "file",
      DATA_DIR: "./data/e2e",
      SITE_URL: `http://localhost:${PORT}`,
      RATE_LIMIT_MAX: "6",
      // Lets each test use its own client address via X-Forwarded-For, so rate limits do not collide.
      TRUST_PROXY: "true",
    },
  },
});
