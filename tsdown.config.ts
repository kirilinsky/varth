import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  outExtensions: () => ({
    dts: ".d.ts",
  }),
  clean: true,
  treeshake: true,
  sourcemap: true,
});
