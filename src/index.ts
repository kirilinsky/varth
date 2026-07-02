import { isColorValue, rampDecls } from "./color";
import { buildCSS } from "./css";
import { THEME_NAME, THEME_TOKEN, VARTH } from "./constants/varth";
import {
  DefineThemesConfig,
  ResolvedProperty,
  VarName,
  VarRef,
} from "./types";

export const defineThemes = <
  Tokens extends string,
  Themes extends string,
  Prefix extends string = "th",
>(
  config: DefineThemesConfig<Tokens, Themes, Prefix>,
) => {
  const {
    prefix = "th" as Prefix,
    themes,
    strategy = "auto",
    properties,
    ramps,
    storageKey = "varth-theme",
  } = config;

  const themeNames = Object.keys(themes) as Themes[];
  const tokenSet = new Set<string>();
  for (const name of themeNames)
    for (const t of Object.keys(themes[name])) tokenSet.add(t);
  const tokens = [...tokenSet] as Tokens[];

  const missing: string[] = [];
  for (const name of themeNames)
    for (const t of tokens)
      if (themes[name][t] === undefined)
        missing.push(`"${t}" in theme "${name}"`);
  if (missing.length > 0)
    throw new Error(`[varth] missing token values: ${missing.join(", ")}`);

  const canLightDark =
    themeNames.length === 2 &&
    (themeNames as string[]).includes("light") &&
    (themeNames as string[]).includes("dark");
  const resolvedStrategy =
    strategy === "auto"
      ? canLightDark
        ? "light-dark"
        : "attribute"
      : strategy;
  if (resolvedStrategy === "light-dark" && !canLightDark)
    throw new Error(
      '[varth] strategy "light-dark" requires exactly two themes named "light" and "dark"',
    );

  const varName = <T extends Tokens>(t: T): VarName<Prefix, T> =>
    `--${prefix}-${t}`;

  const vars = {} as { [K in Tokens]: VarRef<Prefix, K> };
  for (const t of tokens) vars[t] = `var(${varName(t)})`;

  const firstTheme = themeNames[0];
  const resolvedProperties: Record<string, ResolvedProperty> = {};
  if (properties !== undefined && firstTheme !== undefined) {
    if (properties === "auto") {
      for (const t of tokens) {
        if (themeNames.every((name) => isColorValue(themes[name][t])))
          resolvedProperties[varName(t)] = {
            syntax: "<color>",
            inherits: true,
            initialValue: themes[firstTheme][t],
          };
      }
    } else {
      for (const t of tokens) {
        const def = properties[t];
        if (!def) continue;
        resolvedProperties[varName(t)] = {
          syntax: def.syntax ?? "<color>",
          inherits: def.inherits ?? true,
          initialValue: def.initialValue ?? themes[firstTheme][t],
        };
      }
    }
  }

  const allRampDecls: Record<string, string> = {};
  for (const [name, def] of Object.entries(ramps ?? {}))
    Object.assign(
      allRampDecls,
      rampDecls(`--${prefix}-${name}`, def.base, def.steps ?? 10),
    );

  const toCSS = () =>
    buildCSS({
      prefix,
      themeNames,
      themes,
      tokens,
      strategy: resolvedStrategy,
      properties: resolvedProperties,
      rampDecls: allRampDecls,
    });

  const inject = () => {
    if (typeof document === "undefined" || !document.head) return;
    const id = `${VARTH}-${prefix}`;
    const el =
      document.getElementById(id) ??
      document.head.appendChild(
        Object.assign(document.createElement("style"), { id }),
      );
    el.textContent = toCSS();
    // one call = fully themed app: CSS in + the persisted choice re-applied
    const stored = readStored();
    if (stored && (stored === "system" || isTheme(stored))) applyAttr(stored);
  };

  const isTheme = (v: string): v is Themes =>
    (themeNames as string[]).includes(v);

  const readStored = (): string | null => {
    if (typeof localStorage === "undefined") return null;
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const applyAttr = (theme: string) => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (theme === "system") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", theme);
  };

  const setTheme = (theme: Themes | "system"): void => {
    if (theme !== "system" && !isTheme(theme))
      throw new TypeError(`[varth] unknown theme "${theme}"`);
    applyAttr(theme);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // ignore QuotaExceededError / SecurityError
      }
    }
  };

  const getTheme = (): Themes | "system" => {
    if (typeof document !== "undefined") {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr && isTheme(attr)) return attr;
    }
    const stored = readStored();
    if (stored && isTheme(stored)) return stored;
    return "system";
  };

  /**
   * Inline script that applies the persisted theme before first paint.
   * SSR twin of restoreTheme() — put it in <head> for any framework.
   */
  const themeScript = () =>
    `(function(){try{var t=localStorage.getItem(${JSON.stringify(
      storageKey,
    )});if(t&&${JSON.stringify(
      themeNames,
    )}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

  const toTypes = () => {
    if (themeNames.length === 0) return "";
    const union = (names: string[]) =>
      names.map((n) => `  | "${n}"`).join("\n");
    return [
      `export type ${THEME_TOKEN} =`,
      union(tokens.map((t) => varName(t))),
      ``,
      `export type ${THEME_NAME} =`,
      union(themeNames),
      ``,
    ].join("\n");
  };

  return {
    /** Token → `"var(--th-accent)"`, typed. For inline styles / CSS-in-TS. */
    vars,
    themeNames,
    /** Apply + persist. `"system"` removes the attribute — the OS decides. */
    setTheme,
    /** Current selection: attribute → persisted → "system". */
    getTheme,
    /** The stylesheet string — write to a file or a <style> tag. */
    toCSS,
    /** Client startup in one call: <style> tag + persisted theme applied. */
    inject,
    /** Inline <head> script string — applies the saved theme before paint. */
    themeScript,
    toTypes,
    /** Internal contract with the React layer — not documented API. */
    storageKey,
  };
};
