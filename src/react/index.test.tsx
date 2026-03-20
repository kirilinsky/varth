import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { defineThemes } from "..";
import { ThemeProvider, useTheme } from ".";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
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
});
