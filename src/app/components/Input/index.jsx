import styles from "./input.module.css";

export const Input = ({
  variant = "header",
  placeholder = "Digite o produto",
  value,
  onChange,
  autoFocus = false,
  ...props
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={variant === "search" ? styles.searchInput : styles.headerInput}
      autoFocus={autoFocus}
      {...props}
    />
  );
};
