import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Light / dark / system theme. index.html applies the saved theme before the
 * first paint; this keeps it in sync afterwards and follows the OS setting
 * while the choice is "system".
 */
const ThemeContext = createContext(null);
const STORAGE_KEY = "theme";

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const readChoice = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  const [choice, setChoice] = useState(readChoice);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setChoice(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode)
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(resolved === "dark" ? "light" : "dark"),
    [resolved, setTheme],
  );

  const value = useMemo(
    () => ({ theme: choice, resolvedTheme: resolved, setTheme, toggle }),
    [choice, resolved, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
