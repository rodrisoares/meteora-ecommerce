"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "../components/Button";
import styles from "./produtos.module.css";

export const Pagination = ({ page, totalPages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (targetPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <Button
        size="small"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        ← Anterior
      </Button>

      <span className={styles.pageInfo}>
        Página {page} de {totalPages}
      </span>

      <Button
        size="small"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Próxima →
      </Button>
    </nav>
  );
};
