"use client";

import { useRouter } from "next/navigation";
import { SafeImage } from "../SafeImage";
import { Button } from "../Button";
import { Stars } from "../Stars";
import { WishlistButton } from "../WishlistButton";
import { formatPrice } from "../../../../lib/format";
import styles from "./productCard.module.css";

// `showDiscount` controla se o preço promocional aparece. Só a tela de
// promoções ativa; na home e no catálogo o card mostra o preço cheio.
export const ProductCard = ({ product, showDiscount = false }) => {
  const router = useRouter();
  const discount = Number(product.discountPercent) || 0;
  const hasDiscount = showDiscount && discount > 0;
  const finalPrice = product.finalPrice ?? product.price;
  const href = `/produto/${product.id}`;

  // Clicar em qualquer parte do card leva ao detalhe do produto — o mesmo
  // destino do botão "Ver mais". A WishlistButton chama stopPropagation, então
  // não dispara essa navegação.
  const goToProduct = () => router.push(href);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToProduct();
    }
  };

  return (
    <div
      className={styles.card}
      onClick={goToProduct}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Ver mais sobre ${product.name}`}
    >
      <figure style={{ position: "relative" }}>
        <SafeImage
          width={350}
          height={422}
          src={product.imageSrc}
          alt={product.name}
          style={{
            objectFit: "cover",
          }}
          className={styles.image}
        />
        {(hasDiscount || product.isFeatured) && (
          <div className={styles.badges}>
            {hasDiscount && (
              <span className={styles.discountBadge}>-{discount}%</span>
            )}
            {product.isFeatured && (
              <span className={styles.featuredBadge}>⭐ Destaque</span>
            )}
          </div>
        )}
        <WishlistButton product={product} className={styles.wishlist} />
      </figure>
      <section className={styles.info}>
        <p className={styles.title}>{product.name}</p>
        {product.ratingCount > 0 && (
          <div className={styles.rating}>
            <Stars value={product.ratingAvg} count={product.ratingCount} />
          </div>
        )}
        <div className={styles.description}>{product.description}</div>
        <div className={styles.price}>
          {hasDiscount ? (
            <>
              <span className={styles.originalPrice}>
                {formatPrice(product.price)}
              </span>
              <span className={styles.finalPrice}>
                {formatPrice(finalPrice)}
              </span>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </div>
        <Button
          variant="primary"
          size="medium"
          href={href}
          onClick={(e) => e.stopPropagation()}
        >
          Ver mais
        </Button>
      </section>
    </div>
  );
};
