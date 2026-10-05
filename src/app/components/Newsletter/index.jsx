"use client";

import { useState } from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import { useToast } from "../Toast";
import { COUPONS } from "../../../../lib/coupons";
import styles from "./newsletter.module.css";

// Cupom de boas-vindas oferecido na inscrição da newsletter.
const WELCOME_CODE = "METEORA10";
const WELCOME_PERCENT = COUPONS[WELCOME_CODE]?.percent ?? 10;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const Newsletter = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      showToast("Digite um e-mail válido para receber o cupom.", {
        type: "error",
      });
      return;
    }

    // Sem backend de newsletter — apenas revela o cupom de boas-vindas.
    setSubscribed(true);
    showToast(`Cupom ${WELCOME_CODE} liberado. Aproveite!`, {
      type: "success",
    });
  };

  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Clube Meteora</p>
        <h2 id="newsletter-title" className={styles.title}>
          Ganhe {WELCOME_PERCENT}% no primeiro pedido
        </h2>
        <p className={styles.subtitle}>
          Assine nossa newsletter e receba um cupom de boas-vindas, além de
          ofertas exclusivas e lançamentos em primeira mão.
        </p>

        {subscribed ? (
          <div className={styles.success} role="status">
            <span>Use o cupom no checkout:</span>
            <strong className={styles.code}>{WELCOME_CODE}</strong>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              variant="search"
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-mail para newsletter"
            />
            <Button type="submit" variant="primary" size="medium">
              Quero meu cupom
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};
