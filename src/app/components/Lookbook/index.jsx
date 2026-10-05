import Link from "next/link";
import { SafeImage } from "../SafeImage";
import styles from "./lookbook.module.css";

// Grid editorial de categorias — navegação principal por estilo na home.
// As imagens são recortes de produto (PNG transparente), então usamos
// objectFit: contain sobre um fundo para não deformar/ampliar demais.
export const Lookbook = ({ categorias }) => {
  const destaques = categorias ?? [];

  if (destaques.length === 0) {
    return null;
  }

  return (
    <section className={styles.lookbook} aria-labelledby="lookbook-title">
      <h2 id="lookbook-title">Explore por estilo</h2>
      <div className={styles.grid}>
        {destaques.map((categoria) => (
          <Link
            key={categoria.id}
            href={`/produtos?categoria=${categoria.id}`}
            className={styles.tile}
            aria-label={`Ver produtos da categoria ${categoria.name}`}
          >
            <div className={styles.imageWrap}>
              <SafeImage
                fill
                src={categoria.imageSrc}
                alt={`Categoria ${categoria.name}`}
                style={{ objectFit: "contain" }}
                className={styles.image}
                sizes="(max-width: 700px) 100vw, 33vw"
              />
            </div>
            <div className={styles.label}>
              <span className={styles.name}>{categoria.name}</span>
              <span className={styles.cta}>Ver coleção →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
