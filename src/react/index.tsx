import { createContext, useContext, useState, useEffect } from "react";

type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string) => void;
  themeNames: readonly string[];
};

type ThemeProviderProps = {
  children: React.ReactNode;
  default: string;
  themeNames: readonly string[];
  inject: () => void;
};

const Ctx = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("[varth] useTheme must be used within a ThemeProvider");
  return ctx;
};

export const ThemeProvider = ({
  children,
  default: def,
  themeNames,
  inject,
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState(() =>
    typeof localStorage !== "undefined"
      ? (localStorage.getItem("varth-theme") ?? def)
      : def,
  );

  const setTheme = (next: string) => {
    setThemeState(next);
    localStorage.setItem("varth-theme", next);
  };

  useEffect(() => {
    inject();
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, themeNames }}>
      <div data-theme={theme}>{children}</div>
    </Ctx.Provider>
  );
};
