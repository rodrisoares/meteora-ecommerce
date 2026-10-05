import styles from "./productCardSkeleton.module.css";

// Placeholder animado exibido enquanto os produtos carregam
export const ProductCardSkeleton = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.image} />
    <div className={styles.body}>
      <div className={`${styles.line} ${styles.title}`} />
      <div className={styles.line} />
      <div className={`${styles.line} ${styles.short}`} />
      <div className={styles.button} />
    </div>
  </div>
);

export default ProductCardSkeleton;
