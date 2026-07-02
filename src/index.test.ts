import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import { defineThemes } from "./index";

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

const base = {
  themes: {
    light: { accent: "#3b82f6", bg: "#ffffff", radius: "8px" },
    dark: { accent: "#60a5fa", bg: "#0f172a", radius: "8px" },
  },
} as const;

describe("type inference", () => {
  it("infers theme and token literals", () => {
    const th = defineThemes(base);
    expectTypeOf(th.themeNames).toEqualTypeOf<("light" | "dark")[]>();
    expectTypeOf(th.vars.accent).toEqualTypeOf<"var(--th-accent)">();
    expectTypeOf(th.vars.bg).toEqualTypeOf<"var(--th-bg)">();
  });

  it("infers a custom prefix", () => {
    const th = defineThemes({ ...base, prefix: "ui" });
    expectTypeOf(th.vars.accent).toEqualTypeOf<"var(--ui-accent)">();
  });

  it("rejects a theme with a missing token at compile time and runtime", () => {
    expect(() =>
      defineThemes({
        // @ts-expect-error dark is missing "bg"
        themes: { light: { accent: "#fff", bg: "#000" }, dark: { accent: "#000" } },
      }),
    ).toThrow('missing token values: "bg" in theme "dark"');
  });
});

describe("runtime validation", () => {
  it("throws on missing token values from untyped callers", () => {
    expect(() =>
      defineThemes({
        themes: { light: { accent: "#fff" }, dark: {} } as Record<
          string,
          Record<string, string>
        >,
      }),
    ).toThrow('[varth] missing token values: "accent" in theme "dark"');
  });

  it("throws when light-dark is forced without light/dark themes", () => {
    expect(() =>
      defineThemes({
        strategy: "light-dark",
        themes: { ocean: { accent: "#fff" }, forest: { accent: "#000" } },
      }),
    ).toThrow('requires exactly two themes named "light" and "dark"');
  });
});

describe("light-dark strategy (auto)", () => {
  const th = defineThemes({
    themes: {
      light: {
        accent: "#3b82f6",
        radius: "8px",
        shadow: "0 1px 2px rgb(0 0 0 / 0.1)",
      },
      dark: {
        accent: "#60a5fa",
        radius: "8px",
        shadow: "0 1px 2px rgb(0 0 0 / 0.6)",
      },
    },
  });
  const css = th.toCSS();

  it("resolves to light-dark for a light/dark pair", () => {
    expect(css).toContain("light-dark(");
  });

  it("emits color-scheme and folds color tokens into light-dark()", () => {
    expect(css).toContain("color-scheme: light dark");
    expect(css).toContain("--th-accent: light-dark(#3b82f6, #60a5fa)");
  });

  it("emits identical tokens once, without light-dark()", () => {
    expect(css).toContain("--th-radius: 8px");
    expect(css).not.toContain("light-dark(8px");
  });

  it("falls back to media query + attribute for differing non-colors", () => {
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).toContain("--th-shadow: 0 1px 2px rgb(0 0 0 / 0.6)");
  });

  it("emits color-scheme overrides for explicit choice", () => {
    expect(css).toContain('[data-theme="light"] {\n  color-scheme: light;\n}');
    expect(css).toContain('[data-theme="dark"]');
  });
});

describe("attribute strategy", () => {
  const th = defineThemes({
    prefix: "ui",
    themes: {
      ocean: { accent: "#0ea5e9" },
      forest: { accent: "#22c55e" },
      sand: { accent: "#eab308" },
    },
  });
  const css = th.toCSS();

  it("resolves to attribute for non light/dark theme sets", () => {
    expect(css).not.toContain("light-dark(");
    expect(css).not.toContain("color-scheme");
  });

  it("uses the first theme as :root default", () => {
    expect(css).toContain(':root,\n[data-theme="ocean"]');
  });

  it("emits a block per theme", () => {
    expect(css).toContain('[data-theme="forest"]');
    expect(css).toContain('[data-theme="sand"]');
    expect(css).toContain("--ui-accent: #22c55e");
  });
});

describe("@property", () => {
  it('"auto" registers color tokens only', () => {
    const css = defineThemes({ ...base, properties: "auto" }).toCSS();
    expect(css).toContain("@property --th-accent");
    expect(css).toContain('syntax: "<color>"');
    expect(css).toContain("inherits: true");
    expect(css).toContain("initial-value: #3b82f6");
    expect(css).not.toContain("@property --th-radius");
  });

  it("accepts per-token definitions", () => {
    const css = defineThemes({
      ...base,
      properties: { radius: { syntax: "<length>" } },
    }).toCSS();
    expect(css).toContain("@property --th-radius");
    expect(css).toContain('syntax: "<length>"');
    expect(css).toContain("initial-value: 8px");
    expect(css).not.toContain("@property --th-accent");
  });
});

describe("ramps", () => {
  const css = defineThemes({
    ...base,
    ramps: { brand: { base: "#3b82f6", steps: 5 } },
  }).toCSS();

  it("emits the base and derived oklch shades", () => {
    expect(css).toContain("--th-brand: #3b82f6");
    expect(css).toContain("--th-brand-1: oklch(from var(--th-brand) 0.97");
    expect(css).toContain("--th-brand-5: oklch(from var(--th-brand) 0.2");
    expect(css).not.toContain("--th-brand-6");
  });

  it("damps chroma toward the ends", () => {
    expect(css).toContain("calc(c * 0.3)");
    expect(css).toContain("calc(c * 1)");
  });
});

describe("vars", () => {
  it("exposes typed var() references", () => {
    const th = defineThemes(base);
    expect(th.vars.accent).toBe("var(--th-accent)");
    expect(th.vars.radius).toBe("var(--th-radius)");
  });
});

describe("setTheme / getTheme", () => {
  const th = defineThemes(base);

  it("setTheme applies the attribute and persists", () => {
    th.setTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("varth-theme")).toBe("dark");
  });

  it('setTheme("system") removes the attribute', () => {
    th.setTheme("dark");
    th.setTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(localStorage.getItem("varth-theme")).toBe("system");
  });

  it("setTheme throws on an unknown theme (and rejects it in types)", () => {
    // @ts-expect-error not a theme name
    expect(() => th.setTheme("drak")).toThrow('[varth] unknown theme "drak"');
  });

  it("getTheme prefers the attribute, then storage, then system", () => {
    expect(th.getTheme()).toBe("system");
    localStorage.setItem("varth-theme", "dark");
    expect(th.getTheme()).toBe("dark");
    document.documentElement.setAttribute("data-theme", "light");
    expect(th.getTheme()).toBe("light");
    expectTypeOf(th.getTheme()).toEqualTypeOf<"light" | "dark" | "system">();
  });

  it("inject re-applies the persisted choice and ignores garbage", () => {
    localStorage.setItem("varth-theme", "dark");
    th.inject();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    localStorage.setItem("varth-theme", "hacked");
    th.inject();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("survives a throwing localStorage on both read and write", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("SecurityError");
        },
        setItem() {
          throw new Error("QuotaExceededError");
        },
      },
    });
    try {
      expect(() => th.setTheme("dark")).not.toThrow();
      expect(th.getTheme()).toBe("dark"); // attribute set, storage unreadable
      document.documentElement.removeAttribute("data-theme");
      expect(th.getTheme()).toBe("system");
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });

  it("respects a custom storageKey", () => {
    const custom = defineThemes({ ...base, storageKey: "my-key" });
    custom.setTheme("dark");
    expect(localStorage.getItem("my-key")).toBe("dark");
    expect(custom.storageKey).toBe("my-key");
  });
});

describe("themeScript", () => {
  it("emits an IIFE with the storage key and valid theme names", () => {
    const js = defineThemes({ ...base, storageKey: "my-key" }).themeScript();
    expect(js).toContain('localStorage.getItem("my-key")');
    expect(js).toContain('["light","dark"]');
    expect(js).toContain('setAttribute("data-theme",t)');
  });

  it("applies a stored theme when evaluated", () => {
    const th = defineThemes(base);
    localStorage.setItem("varth-theme", "dark");
    // eslint-disable-next-line no-eval
    eval(th.themeScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores a stored value that is not a theme when evaluated", () => {
    const th = defineThemes(base);
    localStorage.setItem("varth-theme", "hacked");
    // eslint-disable-next-line no-eval
    eval(th.themeScript());
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });
});

describe("inject", () => {
  const th = defineThemes({ ...base, prefix: "ui" });

  it("injects a style tag into document.head and is idempotent", () => {
    th.inject();
    th.inject();
    const els = document.querySelectorAll("#varth-ui");
    expect(els.length).toBe(1);
    expect(els[0]?.tagName).toBe("STYLE");
    expect(els[0]?.textContent).toContain("--ui-accent");
  });

  it("does nothing when document.head is null", () => {
    const original = document.head;
    Object.defineProperty(document, "head", {
      value: null,
      configurable: true,
    });
    expect(() => th.inject()).not.toThrow();
    Object.defineProperty(document, "head", {
      value: original,
      configurable: true,
    });
  });
});

describe("toTypes", () => {
  it("emits token and theme unions", () => {
    const types = defineThemes(base).toTypes();
    expect(types).toContain("export type ThemeToken =");
    expect(types).toContain('| "--th-accent"');
    expect(types).toContain("export type ThemeName =");
    expect(types).toContain('| "dark"');
  });

  it("returns empty string without themes", () => {
    const th = defineThemes({
      themes: {} as Record<string, Record<string, string>>,
    });
    expect(th.toTypes()).toBe("");
    expect(th.toCSS()).toBe("");
  });
});
