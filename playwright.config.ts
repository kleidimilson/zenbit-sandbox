import { defineConfig, devices } from "@playwright/test";

// BASE_URL definido = roda contra um ambiente (staging/produção); senão sobe o app local.
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const local = !process.env.BASE_URL;
const functional = { testDir: "e2e", testIgnore: ["visual/**", "a11y/**", "smoke/**"] };

export default defineConfig({
  reporter: [["html", { open: "never" }], ["list"]],
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: "retain-on-failure", locale: "pt-BR", timezoneId: "America/Fortaleza" },
  webServer: local
    ? {
        command: "pnpm --filter web start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    { name: "chromium", ...functional, use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", ...functional, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", ...functional, use: { ...devices["Desktop Safari"] } },
    { name: "a11y", testDir: "e2e/a11y", use: { ...devices["Desktop Chrome"] } },
    { name: "regression", testDir: "tests/regression/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "smoke", testDir: "e2e/smoke", use: { ...devices["Desktop Chrome"] } },
  ],
});
