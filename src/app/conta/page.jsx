"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../components/Button";
import { formatPrice } from "../../../lib/format";
import { API_ENDPOINTS } from "../../../lib/config";
import styles from "./conta.module.css";

export default function ContaPage() {
  const { user, isAuthenticated, hydrated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !user?.email) return;

    let active = true;
    setLoading(true);

    fetch(`${API_ENDPOINTS.ORDERS}?email=${encodeURIComponent(user.email)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (active) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error("Erro ao carregar pedidos:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hydrated, user]);

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <p>Carregando…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.page}>
        <h1 className={styles.heading}>Minha conta</h1>
        <p className={styles.notice}>Você precisa entrar para ver sua conta.</p>
        <Button variant="primary" href="/login">
          Entrar
        </Button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Olá, {user.name}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
      </div>

      <h2 id="pedidos" className={styles.subheading}>Meus pedidos</h2>

      {loading ? (
        <p>Carregando pedidos…</p>
      ) : orders.length === 0 ? (
        <p className={styles.notice}>
          Você ainda não fez pedidos.{" "}
          <Link href="/produtos" className={styles.link}>
            Ver produtos
          </Link>
        </p>
      ) : (
        <ul className={styles.orders}>
          {orders.map((order) => (
            <li key={order.id} className={styles.order}>
              <div className={styles.orderTop}>
                <strong>Pedido #{order.id}</strong>
                <span className={styles.status}>{order.status}</span>
              </div>
              <p className={styles.orderMeta}>
                {new Date(order.createdAt).toLocaleString("pt-BR")}
              </p>
              <ul className={styles.orderItems}>
                {(order.items ?? []).map((item, index) => (
                  <li key={index}>
                    {item.quantity}× {item.name}
                    {item.size ? ` (${item.size})` : ""}
                  </li>
                ))}
              </ul>
              <div className={styles.orderTotal}>
                Total: {formatPrice(order.total)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
