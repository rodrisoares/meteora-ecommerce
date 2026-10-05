import Link from "next/link";
import { Stars } from "../Stars";
import styles from "./depoimentos.module.css";

// Prova social na home: melhores avaliações reais dos produtos.
// Recebe as reviews já filtradas pelo servidor (fetchTopReviews).
export const Depoimentos = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.depoimentos} aria-labelledby="depoimentos-title">
      <h2 id="depoimentos-title">Quem comprou, aprova</h2>
      <div className={styles.container}>
        {reviews.map((review) => (
          <figure key={review.id} className={styles.card}>
            <Stars value={review.rating} size={18} showCount={false} />
            <blockquote className={styles.quote}>
              “{review.comment}”
            </blockquote>
            <figcaption className={styles.author}>
              <span className={styles.name}>{review.author}</span>
              <Link
                href={`/produto/${review.productId}`}
                className={styles.product}
              >
                {review.productName}
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};
