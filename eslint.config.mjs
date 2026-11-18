import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/generated/**",
      "storybook-static/**",
      "playwright-report*/**",
      "test-results/**",
      "**/next-env.d.ts",
      ".zenbit-pipeline/**",
      "packages/ui/src/tokens/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
