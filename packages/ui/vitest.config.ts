import { configDefaults, defineConfig } from "vitest/config";
import { sharedExclude } from "../../vitest.shared";

export default defineConfig({
  test: { name: "ui", environment: "jsdom", exclude: [...configDefaults.exclude, ...sharedExclude] },
});
