import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm", "cjs"],
  dts: true,
  outExtensions: () => ({
    dts: ".d.ts",
  }),
  clean: true,
  treeshake: true,
});
