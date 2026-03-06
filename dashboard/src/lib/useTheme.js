import { useState, useEffect } from "react";

const STORAGE_KEY = "biuaidi-theme";

function resolveInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Manages the app color theme.
 * Persists the choice to localStorage and applies it as data-theme on <html>.
 *
 * @returns {{ theme: "dark"|"light", toggle: () => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
