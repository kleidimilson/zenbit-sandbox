// Acessibilidade: nenhuma violação serious/critical do axe nas rotas listadas.
// Acrescente toda tela nova em ROUTES (o agente frontend faz isso pela skill web-feature).
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES: string[] = ["/"];

for (const route of ROUTES) {
  test(`a11y ${route}`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
