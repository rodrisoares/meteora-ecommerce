"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { formatPrice } from "../../../lib/format";
import { API_ENDPOINTS } from "../../../lib/config";
import { evaluateCoupon } from "../../../lib/coupons";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const { items, total, clear, hydrated } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("pix");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  // Preview do cupom (o servidor revalida de forma autoritativa no envio)
  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
  const previewTotal = Math.max(0, total - discount);

  const handleApplyCoupon = () => {
    const result = evaluateCoupon(coupon, total);
    setAppliedCoupon(result);
    if (coupon.trim()) {
      showToast(result.message, { type: result.valid ? "success" : "error" });
    }
  };

  // Preenche com os dados do usuário logado quando disponíveis
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      setEmail((prev) => prev || user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) return;
    if (!name.trim() || !email.trim()) {
      showToast("Preencha nome e e-mail.", { type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          address: address.trim(),
          // Envia apenas a identificação; preço/total são calculados no servidor
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
          coupon: coupon.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || `Erro ao finalizar pedido: ${response.status}`
        );
      }

      const created = await response.json();
      clear();
      setOrder(created);
      showToast("Pedido confirmado!", { type: "success" });
    } catch (error) {
      console.error(error);
      showToast(
        error.message || "Não foi possível finalizar o pedido. Tente novamente.",
        { type: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmação
  if (order) {
    return (
      <main className={styles.page}>
        <div className={styles.confirmation}>
          <div className={styles.checkIcon} aria-hidden="true">
            ✅
          </div>
          <h1>Pedido confirmado!</h1>
          <p>
            Seu pedido <strong>#{order.id}</strong> foi registrado com sucesso.
          </p>
          {order.couponCode && (
            <p className={styles.confirmationCoupon}>
              Cupom <strong>{order.couponCode}</strong> aplicado — você economizou{" "}
              {formatPrice(order.discount)}.
            </p>
          )}
          <p className={styles.confirmationTotal}>
            Total: {formatPrice(order.total)}
          </p>
          <div className={styles.confirmationActions}>
            <Button variant="primary" href="/conta">
              Ver meus pedidos
            </Button>
            <Button variant="secondary" href="/produtos">
              Continuar comprando
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.heading}>Checkout</h1>
        <p className={styles.empty}>
          Sua sacola está vazia.{" "}
          <Link href="/produtos" className={styles.link}>
            Ver produtos
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Finalizar compra</h1>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Dados de entrega</h2>

          <label className={styles.field}>
            <span>Nome completo</span>
            <Input
              variant="search"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nome completo"
            />
          </label>

          <label className={styles.field}>
            <span>E-mail</span>
            <Input
              variant="search"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-mail"
            />
          </label>

          <label className={styles.field}>
            <span>Endereço</span>
            <Input
              variant="search"
              placeholder="Rua, número, cidade"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-label="Endereço"
            />
          </label>

          <div className={styles.field}>
            <span>Cupom de desconto</span>
            <div className={styles.couponRow}>
              <Input
                variant="search"
                placeholder="Ex.: METEORA10"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                aria-label="Cupom de desconto"
              />
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={handleApplyCoupon}
              >
                Aplicar
              </Button>
            </div>
            {appliedCoupon?.message && (
              <span
                className={
                  appliedCoupon.valid ? styles.couponOk : styles.couponError
                }
              >
                {appliedCoupon.message}
              </span>
            )}
          </div>

          <fieldset className={styles.payment}>
            <legend>Forma de pagamento (simulada)</legend>
            {[
              { value: "pix", label: "Pix" },
              { value: "cartao", label: "Cartão de crédito" },
              { value: "boleto", label: "Boleto" },
            ].map((option) => (
              <label key={option.value} className={styles.radio}>
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={payment === option.value}
                  onChange={(e) => setPayment(e.target.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={submitting}
            className={styles.submit}
          >
            {submitting ? "Processando..." : "Confirmar pedido"}
          </Button>
        </form>

        <aside className={styles.summary}>
          <h2>Resumo</h2>
          <ul className={styles.summaryItems}>
            {items.map((item) => (
              <li key={item.key}>
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.summarySubtotal}>
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          {discount > 0 && (
            <div className={styles.summaryDiscount}>
              <span>Cupom {appliedCoupon.code}</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatPrice(previewTotal)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
