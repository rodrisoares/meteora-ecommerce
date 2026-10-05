"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { SafeImage } from "../components/SafeImage";
import { Button } from "../components/Button";
import { formatPrice } from "../../../lib/format";
import styles from "./carrinho.module.css";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, clear, total, count, hydrated } =
    useCart();

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <p>Carregando…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.heading}>Sua sacola</h1>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            🛒
          </div>
          <p>Sua sacola está vazia.</p>
          <Link href="/produtos" className={styles.link}>
            Ver produtos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Sua sacola ({count})</h1>

      <div className={styles.layout}>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.key} className={styles.item}>
              <SafeImage
                src={item.imageSrc}
                alt={item.name}
                width={90}
                height={110}
                className={styles.image}
                style={{ objectFit: "cover" }}
              />
              <div className={styles.details}>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.variant}>
                  {item.color && <span>Cor: {item.color} </span>}
                  {item.size && <span>· Tam: {item.size}</span>}
                </p>
                <p className={styles.price}>{formatPrice(item.price)}</p>
              </div>

              <div className={styles.qty}>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span aria-live="polite">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={styles.remove}
                onClick={() => removeItem(item.key)}
                aria-label={`Remover ${item.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className={styles.summary}>
          <h2>Resumo</h2>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className={styles.row}>
            <span>Frete</span>
            <span>Grátis</span>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button
            variant="primary"
            size="large"
            href="/checkout"
            className={styles.checkout}
          >
            Finalizar compra
          </Button>
          <button type="button" className={styles.clear} onClick={clear}>
            Esvaziar sacola
          </button>
        </aside>
      </div>
    </main>
  );
}
