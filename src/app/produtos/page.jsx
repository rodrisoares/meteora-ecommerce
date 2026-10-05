import Link from "next/link";
import styles from "./produtos.module.css";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ActiveFilters } from "./ActiveFilters";
import { Pagination } from "./Pagination";
import {
  fetchProductsCatalog,
  fetchCategories,
  fetchFilterFacets,
} from "../../../lib/data-layer";
import { catalogQuerySchema } from "../../../lib/validation";

export const metadata = {
  title: "Produtos | Meteora",
  description:
    "Explore todo o catálogo da Meteora com filtros por categoria, preço, cor e tamanho.",
};

// SSR dinâmico: o resultado depende dos filtros presentes na URL
export const dynamic = "force-dynamic";

export default async function ProdutosPage({ searchParams }) {
  const sp = await searchParams;

  // Sanitiza os filtros da URL (valores inválidos são ignorados via .catch)
  const q = catalogQuerySchema.parse(sp);

  const filters = {
    categoryId: q.categoria,
    color: q.cor,
    size: q.tamanho,
    minPrice: q.precoMin,
    maxPrice: q.precoMax,
    sort: q.ordenar,
    page: q.pagina,
  };

  const [catalog, categories, facets] = await Promise.all([
    fetchProductsCatalog(filters),
    fetchCategories(),
    fetchFilterFacets(),
  ]);

  const { products, totalCount, page, totalPages } = catalog;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Nossos Produtos</h1>
        <p>{totalCount} produto(s) no catálogo</p>
      </header>

      <div className={styles.layout}>
        <ProductFilters categories={categories} facets={facets} />

        <section className={styles.content}>
          <ActiveFilters categories={categories} />

          {products.length > 0 ? (
            <>
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} />
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon} aria-hidden="true">
                🔍
              </div>
              <p>Nenhum produto encontrado com os filtros selecionados.</p>
              <Link href="/produtos" className={styles.emptyLink}>
                Limpar filtros
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
