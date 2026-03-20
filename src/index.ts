import { THEME_NAME, THEME_TOKEN, VARTH } from "./constants/varth";
import { CSSVarItem, DefineThemesConfig } from "./types";

const getTokenKey = (token: string, prefix: string) => {
  return `--${prefix}-${token}`;
};

const createTheme = ({
  prefix,
  tokens,
  colors,
}: {
  prefix: string;
  tokens: readonly string[];
  colors?: readonly string[];
}) => {
  let result: Record<string, string> = {};
  tokens.forEach((token: string, idx) => {
    result[getTokenKey(token, prefix)] = colors?.[idx] ?? "";
  });
  return result;
};

const getDataAttributeString = (themeName: string) =>
  `[data-theme="${themeName}"] {\n`;

const buildOneThemeString = (key: string, value: string) => {
  return `${key}: ${value};\n`;
};

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

  const getThemeVars = (key: string) => {
    return themesObject[key] ?? {};
  };

  const toCSS = () => {
    let first = true;
    let root = `:root,\n`;
    let result = ``;
    for (const theme in themesObject) {
      if (first) {
        result += root;
        first = false;
      }
      let header = getDataAttributeString(theme);
      result += `${header}`;
      let themeVars = getThemeVars(theme);
      Object.entries(themeVars).forEach(([key, value]) => {
        result += buildOneThemeString(key, value);
      });
      result += `}\n\n`;
    }

    return result;
  };

  const inject = () => {
    if (typeof document === "undefined") return;
    const tagId = `${VARTH}-${prefix}`;
    const injected = document.getElementById(tagId);
    const styleContent = toCSS();
    if (injected) {
      injected.textContent = styleContent;
      return;
    }
    const styleTag = document.createElement("style");
    styleTag.id = tagId;
    styleTag.textContent = styleContent;

    window.document.head.appendChild(styleTag);
    console.info(`[varth] 💉 injected <style id="${tagId}">`);
  };

  const buildTypes = (names: string[]) => {
    let lines = ``;
    names.forEach((prop) => {
      lines += `| '${prop}'\n`;
    });
    return lines;
  };

  const toTypes = () => { 
    const themes = Object.keys(themesObject);
    const tokens = Object.keys(getThemeVars(themes[0] ?? ""));
    let result = ``;

    result += `export type ${THEME_TOKEN} =\n`;
    result += buildTypes(tokens);
    result += "\n\n";
    result += `export type ${THEME_NAME} =\n`;
    result += buildTypes(themes);
    result += `\n\n}`;
    return result;
  };

  return { getThemeVars, toCSS, inject, toTypes };
};
