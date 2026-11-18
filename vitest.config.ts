// Config raiz: roda todos os projetos do monorepo + a suíte de regressão e
// aplica os mínimos de cobertura (gate coverage). Mínimos vêm de pipeline.config.json.
import { defineConfig } from "vitest/config";
import { sharedExclude } from "./vitest.shared";

export default defineConfig({
  test: {
    projects: [
      "apps/*",
      "packages/*",
      {
        test: {
          name: "regression",
          include: ["tests/regression/**/*.test.ts"],
          exclude: ["tests/regression/e2e/**", ...sharedExclude],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "cobertura", "lcov", "json-summary"],
      include: ["apps/*/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.{test,spec}.{ts,tsx}",
        "**/*.stories.tsx",
        "**/*.d.ts",
        "**/generated/**",
        "**/tokens/**",
        "**/__mocks__/**",
        "**/fixtures/**",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
