"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";
import { DB_CONNECTION_ERROR_DIGEST } from "../../lib/errors";

// Fronteira de erro do App Router: captura qualquer falha de render dos
// Server Components (ex.: banco indisponível) e exibe uma tela amigável.
// Fica dentro do layout, então Header e Footer permanecem visíveis.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Registro para depuração (em produção a mensagem original vem mascarada).
    console.error("Erro capturado pela fronteira da aplicação:", error);
  }, [error]);

  // Em produção o Next só encaminha `digest`; usamos ele para identificar a causa.
  const isDatabaseDown = error?.digest === DB_CONNECTION_ERROR_DIGEST;

  const title = isDatabaseDown
    ? "Estamos com uma instabilidade momentânea"
    : "Ops! Algo deu errado";

  const description = isDatabaseDown
    ? "Não conseguimos carregar as informações agora. Tente novamente em alguns instantes."
    : "Encontramos um problema inesperado ao carregar esta página. Você pode tentar novamente.";

  return (
    <main className={styles.container} role="alert" aria-live="assertive">
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          {isDatabaseDown ? "🔌" : "⚠️"}
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.retry}
            onClick={() => reset()}
          >
            Tentar novamente
          </button>
          <Link href="/" className={styles.homeLink}>
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
