// Limites de Clean Code (gate "architecture"), aplicados só aos arquivos
// novos/alterados do PR (scripts/check-quality.sh). Valores de pipeline.config.json.
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/generated/**",
      "**/*.d.ts",
      "**/tokens/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { sonarjs },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 3],
      "max-lines-per-function": ["error", { max: 40, skipBlankLines: true, skipComments: true }],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-nested-callbacks": ["error", 3],
      "no-nested-ternary": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-small-switch": "error",
    },
  },
  {
    // componentes: JSX ocupa linhas sem adicionar lógica
    files: ["**/*.{tsx,jsx}"],
    rules: { "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "e2e/**", "tests/**", "**/__tests__/**"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-nested-callbacks": "off",
      "sonarjs/no-identical-functions": "off",
    },
  },
);
