"use client";

import styles from "./produtos.module.css";
import { ProductCard } from "../ProductCard";

export const Produtos = ({ produtos }) => {
  if (!produtos) {
    return <div>Carregando produtos...</div>;
  }

  return (
    <section className={styles.products}>
      <h2>Produtos que estão bombando!</h2>
      <div className={styles.container}>
        {produtos.map((produto) => (
          <ProductCard key={produto.id} product={produto} />
        ))}
      </div>
    </section>
  );
};
