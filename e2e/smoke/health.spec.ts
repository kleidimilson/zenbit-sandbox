import { test, expect } from "@playwright/test";

test("app responde", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBeLessThan(400);
});

test("api saudável", async ({ request }) => {
  const res = await request.get(process.env.API_HEALTH_URL ?? "/api/health");
  expect(res.ok()).toBeTruthy();
});
