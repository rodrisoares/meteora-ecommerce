"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "../components/Button";
import styles from "./produtos.module.css";

const SORT_LABELS = [
  { value: "featured", label: "Destaques" },
  { value: "recent", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export const ProductFilters = ({ categories = [], facets = {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("precoMin") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("precoMax") ?? "");

  const current = (key) => searchParams.get(key) ?? "";

  // Atualiza um ou mais parâmetros e sempre volta para a página 1
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("pagina");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  // Alterna um valor: clicar no que já está ativo remove o filtro
  const toggleParam = (key, value) => {
    updateParams({ [key]: current(key) === value ? "" : value });
  };

  const applyPriceRange = () => {
    updateParams({ precoMin: minPrice, precoMax: maxPrice });
  };

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const { colors = [], sizes = [] } = facets;

  return (
    <aside className={styles.filters}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="ordenar">
          Ordenar por
        </label>
        <select
          id="ordenar"
          className={styles.select}
          value={current("ordenar") || "featured"}
          onChange={(e) => updateParams({ ordenar: e.target.value })}
        >
          {SORT_LABELS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="categoria">
          Categoria
        </label>
        <select
          id="categoria"
          className={styles.select}
          value={current("categoria")}
          onChange={(e) => updateParams({ categoria: e.target.value })}
        >
          <option value="">Todas</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {colors.length > 0 && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Cor</span>
          <div className={styles.swatches}>
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={current("cor") === color.name}
                onClick={() => toggleParam("cor", color.name)}
                style={{ backgroundColor: color.hexa }}
                className={`${styles.swatch} ${
                  current("cor") === color.name ? styles.swatchActive : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Tamanho</span>
          <div className={styles.sizes}>
            {sizes.map((size) => (
              <Button
                key={size}
                size="small"
                variant={current("tamanho") === size ? "primary" : "secondary"}
                onClick={() => toggleParam("tamanho", size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Faixa de preço (R$)</span>
        <div className={styles.priceRange}>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
            aria-label="Preço mínimo"
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceInput}
            aria-label="Preço máximo"
          />
        </div>
        <Button size="small" variant="secondary" onClick={applyPriceRange}>
          Aplicar
        </Button>
      </div>

      <Button size="small" variant="ghost" onClick={clearAll}>
        Limpar filtros
      </Button>
    </aside>
  );
};
