export type Strategy = "auto" | "light-dark" | "attribute";

export type PropertyDef = {
  /** CSS `@property` syntax string. Defaults to `"<color>"`. */
  syntax?: string;
  /** Custom properties must inherit for theming to cascade. Defaults to `true`. */
  inherits?: boolean;
  /** Defaults to the token's value in the first theme. */
  initialValue?: string;
};

export type RampDef = {
  /** Base color: any CSS color or a `var()` reference. */
  base: string;
  /** Number of generated shades. Defaults to 10, minimum 2. */
  steps?: number;
};

export type DefineThemesConfig<
  Tokens extends string,
  Themes extends string,
  Prefix extends string,
> = {
  prefix?: Prefix;
  themes: Record<Themes, Record<Tokens, string>>;
  /** localStorage key for the persisted choice. Defaults to `"varth-theme"`. */
  storageKey?: string;
  /**
   * "light-dark" — single `:root` block with `light-dark()` values, theme
   * switching via `color-scheme`. Requires exactly two themes named
   * "light" and "dark".
   * "attribute" — classic `[data-theme]` blocks, any number of themes.
   * "auto" (default) — "light-dark" when possible, otherwise "attribute".
   */
  strategy?: Strategy;
  /**
   * `@property` registration. `"auto"` registers every token whose value
   * is a color in all themes with `syntax: "<color>"`.
   */
  properties?: "auto" | Partial<Record<Tokens, PropertyDef>>;
  /**
   * Color ramps derived from one base color via relative color syntax:
   * `ramps: { brand: { base: "#3b82f6" } }` emits `--th-brand` plus
   * `--th-brand-1..N` oklch shades.
   */
  ramps?: Record<string, RampDef>;
};

export type VarthOut = {
  /** Where `varth gen` writes the stylesheet. Defaults to `"varth.css"`. */
  css?: string;
  /**
   * Where `varth gen` writes the theme-switcher module (typed via a derived
   * sibling `.d.ts`). Defaults to `"varth.js"`; `false` disables it.
   */
  js?: string | false;
};

/**
 * Shape of `varth.config.ts` (default export). Intentionally non-generic —
 * literal inference doesn't matter for the CLI path; the generated .d.ts
 * carries the types instead. Import it type-only so the config file has no
 * runtime dependency:
 *
 *   import type { VarthConfig } from "var-th";
 *   const config: VarthConfig = { themes: { ... }, out: { css: "varth.css" } };
 *   export default config;
 */
export type VarthConfig = DefineThemesConfig<string, string, string> & {
  out?: VarthOut;
};

export type VarName<P extends string, T extends string> = `--${P}-${T}`;
export type VarRef<P extends string, T extends string> = `var(--${P}-${T})`;

export type ResolvedProperty = {
  syntax: string;
  inherits: boolean;
  initialValue: string;
};
