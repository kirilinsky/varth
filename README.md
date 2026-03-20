# var-th

[![codecov](https://codecov.io/github/kirilinsky/varth/graph/badge.svg?token=AJLJGZVFSN)](https://codecov.io/github/kirilinsky/varth)
[![npm downloads](https://img.shields.io/npm/dm/var-th)](https://www.npmjs.com/package/var-th)
[![npm](https://img.shields.io/npm/v/var-th)](https://www.npmjs.com/package/var-th)
[![bundle size](https://img.shields.io/bundlephobia/minzip/var-th)](https://bundlephobia.com/package/var-th)
[![license](https://img.shields.io/npm/l/var-th)](./LICENSE)

<img src="https://i.ibb.co/LDRCjDTj/varth-logo-t.png" alt="var-th" />

Stop writing CSS variables by hand. Define your themes as compact arrays, get type-safe utilities back. No runtime overhead, no magic — just your tokens turned into `--custom-properties` and a few helpers to apply them.

## Install

```bash
npm install var-th
```

---

## Core

### Setup

```ts
import { defineThemes } from "var-th";

const { getVarths, inject, toCSS, toTypes, themeNames } = defineThemes({
  tokens: ["accent", "bg", "color", "textSm"] as const,
  themes: {
    light: ["#3b82f6", "#ffffff", "#111827", "16px"],
    dark: ["#60a5fa", "#0f172a", "#f1f5f9", "16px"],
  },
});
```

`prefix` is optional and defaults to `"th"` — so your variables come out as `--th-accent`, `--th-bg`, `--th-color`, `--th-textSm` without any extra config. Set it explicitly if you want something else:

```ts
defineThemes({
  prefix: "brand",
  tokens: ["accent", "bg"] as const,
  themes: { ... },
});
// → --brand-accent, --brand-bg
```

---

### `getVarths(name)`

Returns a CSS variable object ready to drop into `style={}`. The fastest way to apply a theme to any element:

```tsx
<div style={getVarths("light")}>...</div>

// getVarths("light") returns:
{
  "--th-accent": "#3b82f6",
  "--th-bg": "#ffffff",
  "--th-color": "#111827",
  "--th-textSm": "16px",
}
```

---

### `inject()`

Injects all themes into `<head>` once at app startup. After that, switching themes is just changing a `data-theme` attribute anywhere in the DOM — no re-renders, no JS:

```ts
inject(); // appends <style id="var-th-th"> to document.head
```

```html
<div data-theme="dark">...</div>
```

Calling `inject()` multiple times is safe — it updates the same tag, never duplicates it.

---

### `toCSS()`

Generates a full CSS string with `:root` and `[data-theme]` blocks. Use it for SSR or static exports:

```ts
// Next.js layout.tsx
<style dangerouslySetInnerHTML={{ __html: toCSS() }} />
```

Output:

```css
:root,
[data-theme="light"] {
  --th-accent: #3b82f6;
  --th-bg: #ffffff;
  --th-color: #111827;
  --th-textSm: 16px;
}

[data-theme="dark"] {
  --th-accent: #60a5fa;
  --th-bg: #0f172a;
  --th-color: #f1f5f9;
  --th-textSm: 16px;
}
```

---

### `toTypes()`

Codegen step — run once, commit the result, get autocomplete on your CSS variables everywhere:

```ts
import { writeFileSync } from "fs";
writeFileSync("./src/theme.d.ts", toTypes());
```

Produces:

```ts
export type ThemeToken =
  | "--th-accent"
  | "--th-bg"
  | "--th-color"
  | "--th-textSm";

export type ThemeName = "light" | "dark";
```

---

### `themeNames`

Array of all defined theme names — handy for building a theme picker:

```ts
themeNames.map(t => (
  <button onClick={() => setTheme(t)}>{t}</button>
))
```

---

## Frameworks

### React

```tsx
import { ThemeProvider, useTheme } from "var-th/react";

<ThemeProvider default="light" inject={inject} themeNames={themeNames}>
  <App />
</ThemeProvider>;
```

```tsx
const { theme, setTheme, themeNames } = useTheme()

<button onClick={() => setTheme("dark")}>switch theme</button>
```

Theme name is persisted to `localStorage` automatically.

---

## License

MIT
