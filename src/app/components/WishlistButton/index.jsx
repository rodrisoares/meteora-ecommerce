"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "../Toast";
import styles from "./wishlistButton.module.css";

export const WishlistButton = ({ product, className = "" }) => {
  const { has, toggle, hydrated } = useWishlist();
  const { showToast } = useToast();

  const active = hydrated && has(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wasActive = has(product.id);
    toggle(product);
    showToast(
      wasActive
        ? `"${product.name}" removido dos favoritos`
        : `"${product.name}" adicionado aos favoritos`,
      { type: wasActive ? "info" : "success" }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${active ? styles.active : ""} ${className}`.trim()}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <span aria-hidden="true">{active ? "♥" : "♡"}</span>
    </button>
  );
};

export default WishlistButton;
