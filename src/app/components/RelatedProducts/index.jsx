import { ProductCard } from "../ProductCard";
import styles from "./relatedProducts.module.css";

export const RelatedProducts = ({ produtos = [] }) => {
  if (produtos.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Você também pode gostar</h2>
      <div className={styles.grid}>
        {produtos.map((produto) => (
          <ProductCard key={produto.id} product={produto} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
