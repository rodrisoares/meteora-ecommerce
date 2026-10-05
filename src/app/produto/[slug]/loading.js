import styles from "./loading.module.css";

// Skeleton exibido enquanto os dados do produto carregam.
export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.image} />
      <div className={styles.info}>
        <div className={`${styles.line} ${styles.title}`} />
        <div className={`${styles.line} ${styles.short}`} />
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.short}`} />
        <div className={styles.button} />
      </div>
    </div>
  );
}
