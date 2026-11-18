import { configDefaults, defineConfig } from "vitest/config";
import { sharedExclude } from "../../vitest.shared";

export default defineConfig({
  test: { name: "shared", exclude: [...configDefaults.exclude, ...sharedExclude] },
});
