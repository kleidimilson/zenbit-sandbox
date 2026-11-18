// Use em cada apps/*/vitest.config.ts e packages/*/vitest.config.ts:
//   import { sharedExclude } from "../../vitest.shared";
//   export default defineConfig({ test: { exclude: [...configDefaults.exclude, ...sharedExclude] } });
// *.sandbox.test.ts (chamam o sandbox real de terceiros) só rodam com RUN_SANDBOX=1 (nightly).
export const sharedExclude: string[] = process.env.RUN_SANDBOX === "1" ? [] : ["**/*.sandbox.test.ts"];
