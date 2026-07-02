# var-th

[![codecov](https://codecov.io/github/kirilinsky/varth/graph/badge.svg?token=AJLJGZVFSN)](https://codecov.io/github/kirilinsky/varth)
[![npm downloads](https://img.shields.io/npm/dm/var-th)](https://www.npmjs.com/package/var-th)
[![npm](https://img.shields.io/npm/v/var-th)](https://www.npmjs.com/package/var-th)
[![license](https://img.shields.io/npm/l/var-th)](./LICENSE)

<img src="https://i.ibb.co/LDRCjDTj/varth-logo-t.png" alt="var-th" />

A CLI that turns one theme config into **modern CSS**. You describe your colors once — it writes the stylesheet you'd craft by hand in 2026: `light-dark()`, `color-scheme`, `@property`, oklch color ramps. Nothing from this package ships to the browser.

```bash
npx varth init
```

```
var(−th) v0.2.0

✏ varth.config.ts scaffolded
✓ 6 tokens · 2 themes · strategy: light-dark
✎ varth.css  0.81 kB · gzip 0.29 kB
✎ varth.js  1.06 kB · setTheme/getTheme, zero deps
✎ varth.d.ts  0.29 kB · types for the module above

  light  ██ accent  ██ bg  ██ text  ██ muted  ██ border
  dark   ██ accent  ██ bg  ██ text  ██ muted  ██ border

⚡ done in 23 ms
```

Then, in any project — Next, Vite, plain HTML, no build at all:

1. **Link the CSS**: `import "./varth.css"` or `<link rel="stylesheet" href="varth.css">`.
   Dark mode already works — it follows the OS via `color-scheme`, zero JavaScript.
2. **Use tokens**: `background: var(--th-accent)`.
3. **Switch themes** (optional): `import { setTheme } from "./varth.js"` → `setTheme("dark")`.
   Typed via the sibling `varth.d.ts` — `setTheme("drak")` is a compile error. The choice
   persists to `localStorage` and re-applies on load.

Edit `varth.config.ts` → `npx varth gen` (or `gen --watch` during development). Node ≥ 22.18 reads the TS config natively.

## What it generates

**`varth.css`** — one `:root` block instead of duplicated theme blocks:

```css
:root {
  color-scheme: light dark;
  --th-accent: light-dark(#3d6fb4, #7fa9e0);
  --th-bg: light-dark(#fdfcf7, #212932);
  --th-radius: 8px;
}

[data-theme="light"] { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```

- No `data-theme` attribute → the page follows the system preference, in pure CSS. FOUC is impossible by construction.
- `data-theme` on `<html>` — or **any subtree** — forces a theme for that scope.
- Non-color tokens that differ between themes (shadows, say) can't use `light-dark()` — they get an automatic `@media (prefers-color-scheme)` + attribute fallback. Correct in both modes, no config.
- More than two themes, or old-browser support? `strategy: "attribute"` emits classic `[data-theme]` blocks per theme.

**`varth.js` + `varth.d.ts`** — a ~1 kB dependency-free switcher with your theme names baked in, fully typed:

```ts
import { setTheme, getTheme } from "./varth.js";

setTheme("dark");    // sets data-theme, persists
setTheme("system");  // back to following the OS
getTheme();          // "light" | "dark" | "system"
```

Generated files are yours — commit them, edit them, or `out: { js: false }` them away.

## Config

```ts
// varth.config.ts — import type only, no runtime dependency
import type { VarthConfig } from "var-th";

const config: VarthConfig = {
  prefix: "th",              // → --th-*
  themes: {
    light: { accent: "#3d6fb4", bg: "#fdfcf7", radius: "8px" },
    dark:  { accent: "#7fa9e0", bg: "#212932", radius: "8px" },
  },
  strategy: "auto",          // light-dark for a light/dark pair, else attribute
  properties: "auto",        // @property for every color token → animatable
  ramps: {
    brand: { base: "#3d6fb4", steps: 10 },
  },
  storageKey: "varth-theme", // localStorage key used by varth.js
  out: {
    css: "varth.css",
    js: "varth.js",          // false to skip the switcher
  },
};

export default config;
```

A theme missing a token is an error at generation time — not a silently empty variable in production.

**Ramps**: one brand color in, a palette out — `--th-brand-1..10` emitted as `oklch(from var(--th-brand) …)`. The browser derives the shades; rebranding is a one-value change.

**`@property`**: registered color tokens are typed and animatable — `transition: background-color .2s` works across theme switches.

## SSR / static sites

`varth.js` re-applies the saved theme when it loads, which is fine for SPAs. For server-rendered or static pages that must not flash, inline this in `<head>`:

```html
<script>
  (function(){try{var t=localStorage.getItem("varth-theme");
  if(t&&["light","dark"].indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()
</script>
```

## Demo

```bash
npm run demo   # interactive playground: config in → CSS out, live tokens, ramps
```

## License

MIT
