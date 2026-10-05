import Link from "next/link";
import styles from "./categorias.module.css";
import { SafeImage } from "../SafeImage";

export const Categorias = ({ categorias }) => {
  return (
    <section className={styles.categorias}>
      <h2>Busque por categoria:</h2>
      <div className={styles.container}>
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            href={`/produtos?categoria=${categoria.id}`}
            className={styles.card}
            aria-label={`Ver produtos da categoria ${categoria.name}`}
          >
            <div className={styles.imagemContainer}>
              <SafeImage
                width={130}
                height={157}
                src={categoria.imageSrc}
                alt={`Categoria ${categoria.name}`}
                style={{
                  objectFit: "contain",
                }}
                quality={100}
              />
            </div>
            <p className={styles.title}>{categoria.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
