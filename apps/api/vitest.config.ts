import { configDefaults, defineConfig } from "vitest/config";
import { sharedExclude } from "../../vitest.shared";

export default defineConfig({
  test: { name: "api", exclude: [...configDefaults.exclude, ...sharedExclude] },
});
