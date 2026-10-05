"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "meteora:theme";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  }
  return context;
};

// Aplica o tema no <html data-theme> — as variáveis CSS em globals.css fazem o
// resto. Feito fora do React para o script anti-flash reaproveitar a lógica.
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [hydrated, setHydrated] = useState(false);

  // Lê a preferência salva (ou a do sistema) só no cliente, evitando divergência
  // com o HTML renderizado no servidor.
  useEffect(() => {
    let initial = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        initial = "dark";
      }
    } catch (error) {
      console.error("Erro ao ler tema:", error);
    }
    setTheme(initial);
    applyTheme(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  }, [theme, hydrated]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, toggle, isDark: theme === "dark", hydrated }),
    [theme, toggle, hydrated]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
