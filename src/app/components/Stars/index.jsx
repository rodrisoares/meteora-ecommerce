import styles from "./stars.module.css";

// Exibe uma nota de 0 a 5 em estrelas (somente leitura).
export const Stars = ({ value = 0, count, size = 16, showCount = true }) => {
  const numeric = Number(value) || 0;
  const rounded = Math.round(numeric);

  return (
    <span
      className={styles.stars}
      aria-label={`Avaliação: ${numeric} de 5`}
      title={`${numeric} de 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          style={{ fontSize: size }}
          className={n <= rounded ? styles.filled : styles.empty}
        >
          ★
        </span>
      ))}
      {showCount && typeof count === "number" && (
        <span className={styles.count}>({count})</span>
      )}
    </span>
  );
};

export default Stars;
