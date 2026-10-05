import styles from "./produtos.module.css";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";

// UI de carregamento exibida durante as navegações SSR (mudança de filtros/página)
export default function Loading() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Nossos Produtos</h1>
        <p>Carregando catálogo…</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.filters} aria-hidden="true" />

        <section className={styles.content}>
          <div className={styles.grid}>
            {Array.from({ length: 9 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
