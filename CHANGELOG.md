# var-th

## 0.2.0

### Minor Changes

- b1e2ebc: CLI-only rewrite. `npx varth init` / `varth gen` / `varth gen --watch` compile a `varth.config.ts` into modern CSS — `light-dark()`, `color-scheme`, `@property`, oklch color ramps — plus a generated ~1 kB typed theme switcher (`varth.js` with a derived `varth.d.ts`, so `setTheme("drak")` is a compile error).

  Breaking: all runtime exports (`defineThemes` public API) and the React layer (`ThemeProvider`, `useTheme`, `ThemeScript`, `ThemeStyle`) are removed — the package now ships a `bin` only and nothing reaches the browser bundle. Theme switching lives in the generated `varth.js`. Old positional-array config is gone; themes are keyed objects validated at generation time. Requires Node ≥ 22.18 to read TS configs natively.
