import styles from "./promocoes.module.css";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";

// Skeleton exibido enquanto a lista de promoções carrega (SSR dinâmico).
export default function Loading() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.tag}>🔥 Ofertas</span>
        <h1>Promoções Meteora</h1>
        <p>Carregando as melhores ofertas…</p>
      </section>

      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
