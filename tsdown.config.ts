import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
});
