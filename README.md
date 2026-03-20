# varth

[![codecov](https://codecov.io/github/kirilinsky/varth/graph/badge.svg?token=AJLJGZVFSN)](https://codecov.io/github/kirilinsky/varth)

<img src="https://i.ibb.co/ynfnTPZs/varth-logo.jpg" alt="var-th" />

Type-safe CSS variable themes. Define once, use everywhere.

```ts
import { defineThemes } from "varth";

const { getThemeVars } = defineThemes({
  prefix: "ui",
  tokens: ["accent", "bg", "text"] as const,
  themes: {
    light: ["#3b82f6", "#ffffff", "#111827"],
    dark: ["#60a5fa", "#0f172a", "#f1f5f9"],
  },
});

// TypeScript knows every theme name and every variable
getThemeVars("light"); // → { '--ui-accent': '#3b82f6', ... }
```

## Install

```bash
npm install varth
```

## License

MIT
