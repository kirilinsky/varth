const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const COLOR_FN =
  /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const NAMED = new Set([
  "transparent",
  "currentcolor",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "gray",
  "grey",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "cyan",
  "magenta",
  "teal",
  "navy",
  "olive",
  "maroon",
  "lime",
  "aqua",
  "fuchsia",
  "silver",
  "gold",
  "indigo",
  "violet",
  "coral",
  "salmon",
  "crimson",
  "tomato",
  "turquoise",
  "skyblue",
  "slategray",
  "rebeccapurple",
]);

/**
 * Heuristic. A miss is safe: the token falls back to the attribute /
 * media-query path, which renders correctly for any value.
 */
export const isColorValue = (value: string): boolean => {
  const v = value.trim();
  return HEX.test(v) || COLOR_FN.test(v) || NAMED.has(v.toLowerCase());
};

const RAMP_MAX_L = 0.97;
const RAMP_MIN_L = 0.2;

/**
 * Shades are derived by the browser via relative color syntax — no color
 * math ships in the bundle. Lightness runs 0.97 → 0.20; chroma is damped
 * toward both ends of the ramp so extremes don't oversaturate.
 */
export const rampDecls = (
  varName: string,
  base: string,
  steps: number,
): Record<string, string> => {
  const n = Math.max(2, Math.floor(steps));
  const out: Record<string, string> = { [varName]: base };
  for (let i = 1; i <= n; i++) {
    const t = (i - 1) / (n - 1);
    const l = +(RAMP_MAX_L - t * (RAMP_MAX_L - RAMP_MIN_L)).toFixed(3);
    const c = +(1 - 0.7 * Math.abs(2 * t - 1)).toFixed(2);
    out[`${varName}-${i}`] = `oklch(from var(${varName}) ${l} calc(c * ${c}) h)`;
  }
  return out;
};
