"use client";

import { useTheme } from "@/context/ThemeContext";
import styles from "./themeToggle.module.css";

// Ícone único no header que alterna claro/escuro. Antes da hidratação mostramos
// o ícone da lua de forma neutra para não "piscar" com o estado errado.
export const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggle, hydrated } = useTheme();

  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${styles.toggle} ${className}`.trim()}
      aria-label={label}
      title={label}
      aria-pressed={hydrated ? isDark : undefined}
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
};

export default ThemeToggle;
