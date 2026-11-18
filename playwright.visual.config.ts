// Regressão visual: screenshot de cada story do Storybook (design system) e das
// telas-chave. Baselines em e2e/visual/*-snapshots/, geradas no Linux do CI:
//   docker run --rm -v $PWD:/w -w /w mcr.microsoft.com/playwright:v<versão do @playwright/test>-noble \
//     sh -c "npm i -g pnpm && pnpm i && pnpm storybook:build && pnpm test:visual --update-snapshots"
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e/visual",
  reporter: [["html", { open: "never", outputFolder: "playwright-report-visual" }], ["list"]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: { baseURL: "http://localhost:6006", ...devices["Desktop Chrome"] },
  webServer: {
    command: "pnpm dlx http-server storybook-static -p 6006 -s",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
  },
});
