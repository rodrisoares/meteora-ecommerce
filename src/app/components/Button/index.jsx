"use client";

import { useRouter } from "next/navigation";
import styles from "./button.module.css";

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  href,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e) => {
    if (disabled) return;

    if (href) {
      router.push(href);
    }

    // Se tem onClick customizado, executa
    if (onClick) {
      onClick(e);
    }
  };

  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
