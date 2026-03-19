import { describe, it, expect } from "vitest";
import { defineThemes } from "./index";

describe("getThemeVars", () => {
  it("returns correct CSS vars", () => {
    const { getThemeVars } = defineThemes({
      prefix: "ui",
      tokens: ["accent", "bg"] as const,
      themes: {
        light: ["#ffd", "#000"],
      },
    });

    expect(getThemeVars("light")).toEqual({
      "--ui-accent": "#ffd",
      "--ui-bg": "#000",
    });
  });
});
describe('toCSS', () => {
  const { toCSS } = defineThemes({
    prefix: 'ui',
    tokens: ['accent', 'bg'] as const,
    themes: {
      light: ['#fff', '#000'],
      dark: ['#000', '#fff'],
    },
  })

  it('includes :root for the first theme', () => {
    expect(toCSS()).toContain(':root')
  })

  it('includes data-theme selector for each theme', () => {
    expect(toCSS()).toContain('[data-theme="light"]')
    expect(toCSS()).toContain('[data-theme="dark"]')
  })

  it('includes css variables', () => {
    expect(toCSS()).toContain('--ui-accent: #fff')
    expect(toCSS()).toContain('--ui-bg: #000')
  })
})