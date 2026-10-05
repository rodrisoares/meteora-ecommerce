"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./produtos.module.css";

// Ordem "featured" é o padrão do catálogo → não vira chip.
const SORT_LABELS = {
  recent: "Mais recentes",
  price_asc: "Menor preço",
  price_desc: "Maior preço",
};

export const ActiveFilters = ({ categories = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key) => searchParams.get(key) ?? "";

  const chips = [];

  const categoria = get("categoria");
  if (categoria) {
    const cat = categories.find((c) => String(c.id) === String(categoria));
    chips.push({ key: "categoria", label: `Categoria: ${cat?.name ?? categoria}` });
  }
  if (get("cor")) chips.push({ key: "cor", label: `Cor: ${get("cor")}` });
  if (get("tamanho"))
    chips.push({ key: "tamanho", label: `Tamanho: ${get("tamanho")}` });
  if (get("precoMin"))
    chips.push({ key: "precoMin", label: `Mín: R$ ${get("precoMin")}` });
  if (get("precoMax"))
    chips.push({ key: "precoMax", label: `Máx: R$ ${get("precoMax")}` });

  const ordenar = get("ordenar");
  if (ordenar && SORT_LABELS[ordenar]) {
    chips.push({ key: "ordenar", label: `Ordem: ${SORT_LABELS[ordenar]}` });
  }

  if (chips.length === 0) return null;

  const removeParam = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("pagina");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className={styles.activeFilters}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className={styles.chip}
          onClick={() => removeParam(chip.key)}
          aria-label={`Remover filtro ${chip.label}`}
        >
          {chip.label} <span aria-hidden="true">✕</span>
        </button>
      ))}
      <button
        type="button"
        className={styles.clearChip}
        onClick={() => router.push(pathname)}
      >
        Limpar tudo
      </button>
    </div>
  );
};
