import { THEME_NAME, THEME_TOKEN, VARTH } from "./constants/varth";
import { CSSVarItem, DefineThemesConfig } from "./types";

const key = (token: string, prefix: string) => `--${prefix}-${token}`;

export const defineThemes = ({
  prefix = "th",
  tokens,
  themes,
}: DefineThemesConfig) => {
  const map: Record<string, CSSVarItem<typeof prefix, typeof tokens>> = {};

  for (const t in themes) {
    const vars: Record<string, string> = {};
    tokens.forEach((token, i) => {
      vars[key(token, prefix)] = themes[t]?.[i] ?? "";
    });
    map[t] = vars as CSSVarItem<typeof prefix, typeof tokens>;
  }

  const getVarths = (k: string) => map[k] ?? {};

  const toCSS = () => {
    let r = "",
      first = true;
    for (const t in map) {
      if (first) {
        r += `:root,\n`;
        first = false;
      }
      r += `[data-theme="${t}"] {\n`;
      Object.entries(getVarths(t)).forEach(([k, v]) => {
        r += `${k}: ${v};\n`;
      });
      r += `}\n\n`;
    }
    return r;
  };

  const inject = () => {
    if (typeof document === "undefined") return;
    const id = `${VARTH}-${prefix}`;
    const el =
      document.getElementById(id) ??
      document.head.appendChild(
        Object.assign(document.createElement("style"), { id }),
      );
    el.textContent = toCSS();
  };

  const themeNames = Object.keys(map);

  const toTypes = () => {
    const union = (names: string[]) =>
      names.map((n) => `  | '${n}'`).join("\n");
    return [
      `export type ${THEME_TOKEN} =`,
      union(Object.keys(getVarths(themeNames[0] ?? ""))),
      ``,
      `export type ${THEME_NAME} =`,
      union(themeNames),
    ].join("\n");
  };

  return { getVarths, toCSS, inject, toTypes, themeNames };
};
