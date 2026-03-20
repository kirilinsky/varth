import { describe, it, expect } from "vitest";
import { defineThemes } from "./index";

describe("getVarths", () => {
  it("returns correct CSS vars", () => {
    const { getVarths } = defineThemes({
      prefix: "ui",
      tokens: ["accent", "bg"] as const,
      themes: {
        light: ["#ffd", "#000"],
      },
    });

    expect(getVarths("light")).toEqual({
      "--ui-accent": "#ffd",
      "--ui-bg": "#000",
    });
  });
});
describe("toCSS", () => {
  const { toCSS } = defineThemes({
    prefix: "ui",
    tokens: ["accent", "bg"] as const,
    themes: {
      light: ["#fff", "#000"],
      dark: ["#000", "#fff"],
    },
  });

  it("includes :root for the first theme", () => {
    expect(toCSS()).toContain(":root");
  });

  it("includes data-theme selector for each theme", () => {
    expect(toCSS()).toContain('[data-theme="light"]');
    expect(toCSS()).toContain('[data-theme="dark"]');
  });

  it("includes css variables", () => {
    expect(toCSS()).toContain("--ui-accent: #fff");
    expect(toCSS()).toContain("--ui-bg: #000");
  });
});

describe("inject", () => {
  const { inject } = defineThemes({
    prefix: "ui",
    tokens: ["accent", "bg"] as const,
    themes: {
      light: ["#fff", "#000"],
      dark: ["#000", "#fff"],
    },
  });

  it("injects a style tag into document.head", () => {
    inject();
    const el = document.getElementById("varth-ui");
    expect(el).not.toBeNull();
    expect(el?.tagName).toBe("STYLE");
  });

  it("style tag contains css variables", () => {
    inject();
    const el = document.getElementById("varth-ui");
    expect(el?.textContent).toContain("--ui-accent");
  });

  it("is idempotent — calling twice does not create two tags", () => {
    inject();
    inject();
    const els = document.querySelectorAll("#varth-ui");
    expect(els.length).toBe(1);
  });
});
describe("toTypes", () => {
  const { toTypes } = defineThemes({
    prefix: "ui",
    tokens: ["accent", "bg"] as const,
    themes: {
      light: ["#fff", "#000"],
      dark: ["#000", "#fff"],
    },
  });

  it("contains ThemeToken type", () => {
    expect(toTypes()).toContain("ThemeToken");
  });

  it("contains all css variable names", () => {
    expect(toTypes()).toContain("--ui-accent");
    expect(toTypes()).toContain("--ui-bg");
  });

  it("contains ThemeName type", () => {
    expect(toTypes()).toContain("ThemeName");
  });

  it("contains all theme names", () => {
    expect(toTypes()).toContain("light");
    expect(toTypes()).toContain("dark");
  });
});
