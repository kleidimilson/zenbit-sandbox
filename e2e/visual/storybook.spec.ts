// Gera um teste visual por story do Storybook: todo componente do design system
// com story ganha regressão visual automaticamente.
import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

type Entry = { id: string; title: string; name: string; type?: string; tags?: string[] };
const indexPath = "storybook-static/index.json";
const entries: Entry[] = existsSync(indexPath)
  ? Object.values(JSON.parse(readFileSync(indexPath, "utf8")).entries as Record<string, Entry>)
  : [];

const stories = entries.filter((e) => e.type === "story" && !e.tags?.includes("no-visual"));

test("storybook gerado", () => {
  expect(stories.length, "rode pnpm storybook:build antes").toBeGreaterThan(0);
});

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#storybook-root")).toHaveScreenshot(`${story.id}.png`);
  });
}
