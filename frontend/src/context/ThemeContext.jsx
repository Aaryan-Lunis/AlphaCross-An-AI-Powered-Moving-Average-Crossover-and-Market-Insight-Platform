import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'alphacross-theme';
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

const readInitial = () => {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return 'dark'; // dark is the default
};

const apply = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F3F5F1' : '#101412');
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    // Apply to the DOM first so charts that read CSS variables during the
    // next render already see the new palette.
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next); // only explicit choices are stored
    } catch (e) {
      /* storage unavailable - theme still works for this session */
    }
    setTheme(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
