import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { defineThemes } from "..";
import { ThemeProvider, useTheme } from ".";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const { inject, themeNames } = defineThemes({
  prefix: "ui",
  tokens: ["accent", "bg"] as const,
  themes: {
    light: ["#fff", "#000"],
    dark: ["#000", "#fff"],
  },
});

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button data-testid="button-click" onClick={() => setTheme("dark")}>
      current: {theme}
    </button>
  );
};

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <div>hello</div>
      </ThemeProvider>,
    );
    expect(screen.getByText("hello")).not.toBeNull();
  });

  it("sets data-theme attribute", () => {
    const { container } = render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <div>hello</div>
      </ThemeProvider>,
    );
    expect(container.firstChild).toHaveProperty("dataset.theme", "light");
  });
});

describe("useTheme", () => {
  it("returns current theme", () => {
    render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    expect(screen.getByText("current: light")).not.toBeNull();
  });

  it("throws outside of ThemeProvider", () => {
    expect(() => render(<ThemeSwitcher />)).toThrow(
      "[varth] useTheme must be used within a ThemeProvider",
    );
  });

  it("setTheme updates the theme", async () => {
    render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByTestId("button-click"));
    expect(screen.getByText("current: dark")).not.toBeNull();
  });

  it("setTheme ignores invalid theme names", () => {
    const InvalidSwitcher = () => {
      const { theme, setTheme } = useTheme();
      return (
        <button data-testid="invalid" onClick={() => setTheme("nonexistent")}>
          current: {theme}
        </button>
      );
    };
    render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <InvalidSwitcher />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByTestId("invalid"));
    expect(screen.getByText("current: light")).not.toBeNull();
  });

  it("setTheme does not throw when localStorage.setItem throws", () => {
    const original = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => { throw new Error("QuotaExceededError"); };
    render(
      <ThemeProvider default="light" inject={inject} themeNames={themeNames}>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    expect(() => fireEvent.click(screen.getByTestId("button-click"))).not.toThrow();
    localStorage.setItem = original;
  });
});
