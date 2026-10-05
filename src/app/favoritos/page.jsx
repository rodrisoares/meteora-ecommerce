"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "../components/ProductCard";
import styles from "./favoritos.module.css";

export default function FavoritosPage() {
  const { items, hydrated } = useWishlist();

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <p>Carregando…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Meus favoritos</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            ♡
          </div>
          <p>Você ainda não favoritou nenhum produto.</p>
          <Link href="/produtos" className={styles.link}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
