import Link from "next/link";
import styles from "./promocoes.module.css";
import { ProductCard } from "../components/ProductCard";
import { Pagination } from "../produtos/Pagination";
import { fetchProductsOnSale } from "../../../lib/data-layer";
import { catalogQuerySchema } from "../../../lib/validation";

export const metadata = {
  title: "Promoções | Meteora",
  description:
    "Ofertas com desconto especial na Meteora. Aproveite os preços promocionais enquanto durar!",
};

// SSR dinâmico: a paginação depende da URL
export const dynamic = "force-dynamic";

export default async function PromocoesPage({ searchParams }) {
  const sp = await searchParams;

  // Reaproveita o schema do catálogo só para sanitizar a paginação
  const q = catalogQuerySchema.parse(sp);

  const { products, totalCount, page, totalPages } = await fetchProductsOnSale({
    page: q.pagina,
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.tag}>🔥 Ofertas</span>
        <h1>Promoções Meteora</h1>
        <p>Descontos por tempo limitado — aproveite enquanto durar!</p>
      </section>

      {products.length > 0 ? (
        <>
          <p className={styles.count}>{totalCount} produto(s) em promoção</p>

          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showDiscount />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            🏷️
          </div>
          <p>Nenhuma promoção disponível no momento.</p>
          <Link href="/produtos" className={styles.emptyLink}>
            Ver todos os produtos
          </Link>
        </div>
      )}
    </main>
  );
}
