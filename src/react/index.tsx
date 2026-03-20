import { createContext, useContext, useState, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  default: string;
  themeNames: readonly string[];
  inject: () => void;
};

type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string) => void;
  themeNames: readonly string[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("[varth] useTheme must be used within a ThemeProvider");
  }
  return ctx;
};

export const ThemeProvider = ({
  children,
  default: defaultTheme,
  themeNames,
  inject,
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof localStorage === "undefined") return defaultTheme;
    return localStorage.getItem("varth-theme") ?? defaultTheme;
  });

  const setTheme = (next: string) => {
    setThemeState(next);
    localStorage.setItem("varth-theme", next);
  };

  useEffect(() => {
    inject();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeNames }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};
