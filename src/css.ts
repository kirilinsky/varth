import { isColorValue } from "./color";
import { ResolvedProperty } from "./types";

export type CSSBuildInput = {
  prefix: string;
  themeNames: string[];
  themes: Record<string, Record<string, string>>;
  tokens: string[];
  strategy: "light-dark" | "attribute";
  /** Keyed by full var name (`--th-accent`). */
  properties: Record<string, ResolvedProperty>;
  /** Ramp declarations, already expanded to var name → value. */
  rampDecls: Record<string, string>;
};

const block = (
  selector: string,
  decls: Record<string, string>,
  indent = "",
): string => {
  const lines = Object.entries(decls).map(
    ([k, v]) => `${indent}  ${k}: ${v};`,
  );
  return `${indent}${selector} {\n${lines.join("\n")}\n${indent}}`;
};

const buildAttribute = (input: CSSBuildInput): string[] => {
  const { themeNames, themes, tokens, prefix, rampDecls } = input;
  const varsOf = (name: string): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const t of tokens) out[`--${prefix}-${t}`] = themes[name]![t]!;
    return out;
  };
  const [first, ...rest] = themeNames as [string, ...string[]];
  return [
    block(`:root,\n[data-theme="${first}"]`, {
      ...varsOf(first),
      ...rampDecls,
    }),
    ...rest.map((name) => block(`[data-theme="${name}"]`, varsOf(name))),
  ];
};

const buildLightDark = (input: CSSBuildInput): string[] => {
  const { themes, tokens, prefix, rampDecls } = input;
  const light = themes["light"]!;
  const dark = themes["dark"]!;

  const root: Record<string, string> = { "color-scheme": "light dark" };
  // Tokens that can't be expressed as light-dark() (non-color values that
  // differ between themes). They get the light value in :root plus dark
  // overrides via media query and attribute.
  const darkOverrides: Record<string, string> = {};

  for (const t of tokens) {
    const varName = `--${prefix}-${t}`;
    const lv = light[t]!;
    const dv = dark[t]!;
    if (lv === dv) {
      root[varName] = lv;
    } else if (isColorValue(lv) && isColorValue(dv)) {
      root[varName] = `light-dark(${lv}, ${dv})`;
    } else {
      root[varName] = lv;
      darkOverrides[varName] = dv;
    }
  }
  Object.assign(root, rampDecls);

  const parts = [block(":root", root)];
  if (Object.keys(darkOverrides).length > 0) {
    parts.push(
      `@media (prefers-color-scheme: dark) {\n${block(
        ':root:not([data-theme="light"])',
        darkOverrides,
        "  ",
      )}\n}`,
    );
  }
  // Explicit choice wins over the system preference; setting color-scheme
  // on any element (not just :root) flips light-dark() for its subtree.
  parts.push(block('[data-theme="light"]', { "color-scheme": "light" }));
  parts.push(
    block('[data-theme="dark"]', {
      "color-scheme": "dark",
      ...darkOverrides,
    }),
  );
  return parts;
};

const buildProperties = (
  properties: Record<string, ResolvedProperty>,
): string[] =>
  Object.entries(properties).map(([varName, p]) =>
    [
      `@property ${varName} {`,
      `  syntax: "${p.syntax}";`,
      `  inherits: ${p.inherits};`,
      `  initial-value: ${p.initialValue};`,
      `}`,
    ].join("\n"),
  );

export const buildCSS = (input: CSSBuildInput): string => {
  if (input.themeNames.length === 0) return "";
  const parts =
    input.strategy === "light-dark"
      ? buildLightDark(input)
      : buildAttribute(input);
  parts.push(...buildProperties(input.properties));
  return parts.join("\n\n") + "\n";
};
