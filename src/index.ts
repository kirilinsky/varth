import { THEME_NAME, THEME_TOKEN, VARTH } from "./constants/varth";
import { CSSVarItem, DefineThemesConfig } from "./types";

const getTokenKey = (token: string, prefix: string) => `--${prefix}-${token}`;

const createTheme = ({
  prefix,
  tokens,
  colors,
}: {
  prefix: string;
  tokens: readonly string[];
  colors?: readonly string[];
}) => {
  const result: Record<string, string> = {};
  tokens.forEach((token, idx) => {
    result[getTokenKey(token, prefix)] = colors?.[idx] ?? "";
  });
  return result;
};

/** Define themes and get utilities for applying them */
export const defineThemes = ({
  prefix,
  tokens,
  themes,
}: DefineThemesConfig) => {
  const themesObject: Record<
    string,
    CSSVarItem<typeof prefix, typeof tokens>
  > = {};

  for (const theme in themes) {
    themesObject[theme] = createTheme({
      prefix,
      tokens,
      colors: themes[theme],
    });
  }

  /** Returns CSS variable object for use in style={} */
  const getVarths = (key: string) => themesObject[key] ?? {};

  /** Generates a CSS string with :root and [data-theme] blocks */
  const toCSS = () => {
    let first = true;
    let result = "";

    for (const theme in themesObject) {
      if (first) {
        result += `:root,\n`;
        first = false;
      }
      result += `[data-theme="${theme}"] {\n`;
      Object.entries(getVarths(theme)).forEach(([k, v]) => {
        result += `${k}: ${v};\n`;
      });
      result += `}\n\n`;
    }

    return result;
  };

  /** Injects themes as a <style> tag into document.head. Idempotent. */
  const inject = () => {
    if (typeof document === "undefined") return;
    const tagId = `${VARTH}-${prefix}`;
    const existing = document.getElementById(tagId);
    const content = toCSS();

    if (existing) {
      existing.textContent = content;
      return;
    }

    const tag = document.createElement("style");
    tag.id = tagId;
    tag.textContent = content;
    document.head.appendChild(tag);
    console.info(`[varth] 💉 injected <style id="${tagId}">`);
  };
  const themeNames = Object.keys(themesObject);

  /** Generates TypeScript type declarations for theme tokens and names */
  const toTypes = () => {
    const tokenNames = Object.keys(getVarths(themeNames[0] ?? ""));
    const toUnion = (names: string[]) =>
      names.map((n) => `  | '${n}'`).join("\n");

    return [
      `export type ${THEME_TOKEN} =`,
      toUnion(tokenNames),
      ``,
      `export type ${THEME_NAME} =`,
      toUnion(themeNames),
    ].join("\n");
  };

  return { getVarths, toCSS, inject, toTypes, themeNames };
};
