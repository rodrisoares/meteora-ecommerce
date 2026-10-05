import styles from "./page.module.css";
import { Produtos } from "./components/Produtos";
import { TrustBar } from "./components/TrustBar";
import { Lookbook } from "./components/Lookbook";
import { Depoimentos } from "./components/Depoimentos";
import { Newsletter } from "./components/Newsletter";
import {
  fetchCategories,
  fetchProducts,
  fetchTopReviews,
} from "../../lib/data-layer";
import { unstable_cache } from "next/cache";

// CATEGORIAS = SSG
// PRODUTOS = ISR

const getCachedProducts = unstable_cache(
  () => fetchProducts({ limit: 6 }),
  ["products-home"],
  {
    revalidate: 10,
  }
);

const getCachedTopReviews = unstable_cache(
  () => fetchTopReviews({ limit: 3, minRating: 4 }),
  ["top-reviews-home"],
  {
    revalidate: 60,
  }
);

export default async function Home() {
  const [categorias, produtos, depoimentos] = await Promise.all([
    fetchCategories(),
    getCachedProducts(),
    getCachedTopReviews(),
  ]);

  console.log("A pagina é carregada no navegador");
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {categorias.length > 0 && <Lookbook categorias={categorias} />}
        {produtos.length > 0 && <Produtos produtos={produtos} />}
        {depoimentos.length > 0 && <Depoimentos reviews={depoimentos} />}
        <div className={styles.footerGroup}>
          <Newsletter />
          <TrustBar />
        </div>
      </main>
    </div>
  );
}

//Metadata para SEO
export const metadata = {
  title: "Meteora | Loja de Roupas",
  description:
    "Descubra as últimas tendencias em moda na Meteora. Camisetas, blusas, calçados em muito mais com qualidade e estilo.",
  keywords: "moda, roupas, camisetas, bolsas, calçados, meteora",
  openGraph: {
    title: "Meteora - Loja de Roupas",
    description: "As últimas tendências em moda você encontra aqui!",
    type: "website",
  },
};
