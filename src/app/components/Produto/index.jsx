"use client";

import { useState } from "react";
import { SafeImage } from "../SafeImage";
import { Button } from "../Button";
import { Stars } from "../Stars";
import { WishlistButton } from "../WishlistButton";
import { useToast } from "../Toast";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "../../../../lib/format";
import styles from "./page.module.css";

const Produto = ({ produto }) => {
  const { showToast } = useToast();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(produto.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState(produto?.sizes?.[0] ?? "");

  const discount = Number(produto.discountPercent) || 0;
  const hasDiscount = discount > 0;
  const finalPrice = produto.finalPrice ?? produto.price;

  const handleAddToCart = () => {
    addItem(produto, { color: selectedColor, size: selectedSize });
    showToast(`"${produto.name}" adicionado à sacola`, { type: "success" });
  };

  return (
    <section>
      <h2 style={{ textAlign: "center" }}>Detalhes de {produto.name}</h2>
      <div className={styles.divider}></div>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <SafeImage
            width={350}
            height={422}
            src={produto.imageSrc}
            alt={produto.name}
            className={styles.productImage}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{produto.name}</h1>
            <WishlistButton product={produto} />
          </div>
          {produto.ratingCount > 0 && (
            <div className={styles.rating}>
              <Stars value={produto.ratingAvg} count={produto.ratingCount} size={18} />
            </div>
          )}
          <p className={styles.description}>{produto.description}</p>
          <hr className={styles.divider} />
          <p className={styles.price}>
            {hasDiscount ? (
              <>
                <span className={styles.originalPrice}>
                  {formatPrice(produto.price)}
                </span>
                <span className={styles.finalPrice}>
                  {formatPrice(finalPrice)}
                </span>
                <span className={styles.discountTag}>-{discount}%</span>
              </>
            ) : (
              formatPrice(produto.price)
            )}
          </p>
          <div className={styles.options}>
            {produto.colors?.length > 0 && (
              <div className={styles.colorField}>
                <span className={styles.colorLabel}>
                  Cor: <strong>{selectedColor}</strong>
                </span>
                <div className={styles.colors}>
                  {produto.colors.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        style={{ backgroundColor: color.hexa }}
                        onClick={() => setSelectedColor(color.name)}
                        aria-label={color.name}
                        aria-pressed={isSelected}
                        title={color.name}
                        className={`${styles.colorOption} ${
                          isSelected ? styles.selectedColor : ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {produto?.sizes?.length > 0 && (
              <div className={styles.sizeField}>
                <span className={styles.sizeLabel}>
                  Tamanho: <strong>{selectedSize}</strong>
                </span>
                <div className={styles.sizes}>
                  {produto.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        variant={isSelected ? "primary" : "secondary"}
                        size="small"
                        aria-pressed={isSelected}
                        className={`${styles.sizeOption} ${
                          isSelected ? styles.sizeSelected : ""
                        }`}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            size="large"
            className={styles.addToCart}
            onClick={handleAddToCart}
          >
            Adicionar à sacola
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Produto;
