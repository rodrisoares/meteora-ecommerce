import { cache } from "react";
import {
  fetchProductById,
  fetchProducts,
  fetchRelatedProducts,
  fetchReviewsByProduct,
} from "../../../../lib/data-layer";
import styles from "./page.module.css";
import Produto from "@/app/components/Produto";
import { RelatedProducts } from "@/app/components/RelatedProducts";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ProductReviews } from "@/app/components/ProductReviews";

export const revalidate = 10;

// Deduplica a busca do produto entre generateMetadata e o componente da página
// (mesma requisição => uma única query ao banco).
const getProduto = cache((slug) => fetchProductById(slug));

export async function generateStaticParams() {
  try {
    const products = await fetchProducts({ limit: 100 });

    return products.map((product) => ({
      slug: product.id.toString(),
    }));
  } catch (error) {
    console.error("Erro ao gerar params estáticos:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const produto = await getProduto(slug);

  if (!produto) {
    return {
      title: "Produto não encontrado | Meteora",
      description: "O produto que você procura não existe ou foi removido.",
    };
  }

  const description =
    produto.description?.slice(0, 160) ??
    `Compre ${produto.name} na Meteora.`;

  return {
    title: `${produto.name} | Meteora`,
    description,
    openGraph: {
      title: `${produto.name} | Meteora`,
      description,
      type: "website",
      images: produto.imageSrc ? [{ url: produto.imageSrc }] : [],
    },
  };
}

export default async function ProdutoPage({ params }) {
  const { slug } = await params;

  const produto = await getProduto(slug);

  if (!produto) {
    return (
      <main className={styles.main}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1>Produto não encontrado</h1>
          <p>O produto que você está procurando não existe ou foi removido.</p>
        </div>
      </main>
    );
  }

  const [relacionados, avaliacoes] = await Promise.all([
    fetchRelatedProducts(produto.id, produto.categoryId, 4),
    fetchReviewsByProduct(produto.id),
  ]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...(produto.category?.name
      ? [
          {
            label: produto.category.name,
            href: `/produtos?categoria=${produto.categoryId}`,
          },
        ]
      : []),
    { label: produto.name },
  ];

  return (
    <main className={styles.main}>
      <Breadcrumbs items={breadcrumbItems} />
      <Produto produto={produto} />
      <ProductReviews productId={produto.id} initialReviews={avaliacoes} />
      <RelatedProducts produtos={relacionados} />
    </main>
  );
}
