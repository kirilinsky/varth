# varth

[![codecov](https://codecov.io/github/kirilinsky/varth/graph/badge.svg?token=AJLJGZVFSN)](https://codecov.io/github/kirilinsky/varth)
[![npm downloads](https://img.shields.io/npm/dm/var-th)](https://www.npmjs.com/package/var-th)
[![npm](https://img.shields.io/npm/v/var-th)](https://www.npmjs.com/package/var-th)
[![bundle size](https://img.shields.io/bundlephobia/minzip/var-th)](https://bundlephobia.com/package/var-th)
[![license](https://img.shields.io/npm/l/var-th)](./LICENSE)

<img src="https://i.ibb.co/ynfnTPZs/varth-logo.jpg" alt="var-th" />

Type-safe CSS variable themes. Define once, use everywhere.

## Install

```bash
npm install var-th
```

## What it does

You define your themes in one place as compact arrays. varth turns them into CSS custom properties and gives you a type-safe way to apply them.

```ts
import { defineThemes } from "var-th";

const { getVarths, inject, toCSS, toTypes } = defineThemes({
  prefix: "ui",
  tokens: ["accent", "bg", "text"] as const,
  themes: {
    light: ["#3b82f6", "#ffffff", "#111827"],
    dark: ["#60a5fa", "#0f172a", "#f1f5f9"],
  },
});
```

This gives you `--ui-accent`, `--ui-bg`, `--ui-text` as CSS variables for each theme.

## Usage

### Inline styles

Apply a theme directly to any element via `style={}`:

```tsx
<div style={getVarths("light")}>...</div>
```

### Global inject

Inject all themes into `<head>` once at app startup:

```ts
inject(); // appends <style id="varth-ui"> to document.head
```

Then switch themes by setting `data-theme` on any element:

```html
<div data-theme="dark">...</div>
```

### SSR / static export

Generate a CSS string to include in your HTML:

```ts
// Next.js layout.tsx
<style dangerouslySetInnerHTML={{ __html: toCSS() }} />
```

Output:

```css
:root,
[data-theme="light"] {
  --ui-accent: #3b82f6;
  --ui-bg: #ffffff;
  --ui-text: #111827;
}

[data-theme="dark"] {
  --ui-accent: #60a5fa;
  --ui-bg: #0f172a;
  --ui-text: #f1f5f9;
}
```

### Generate TypeScript types

```ts
import { writeFileSync } from "fs";
writeFileSync("./src/theme.d.ts", toTypes());
```

Produces:

```ts
export type ThemeToken = "--ui-accent" | "--ui-bg" | "--ui-text";

export type ThemeName = "light" | "dark";
```

## React

```tsx
import { ThemeProvider, useTheme } from 'var-th/react'

// wrap your app
<ThemeProvider default="light" inject={inject} themeNames={themeNames}>
  <App />
</ThemeProvider>

// anywhere inside
const { theme, setTheme, themeNames } = useTheme()

<button onClick={() => setTheme('dark')}>switch theme</button>
```

Theme name is persisted to `localStorage` automatically.

## API

| method            | description                                |
| ----------------- | ------------------------------------------ |
| `getVarths(name)` | returns CSS var object for `style={}`      |
| `toCSS()`         | generates full CSS string                  |
| `inject()`        | injects `<style>` tag into `document.head` |
| `toTypes()`       | generates `.d.ts` type declarations        |
| `themeNames`      | array of all defined theme names           |

## License

MIT
