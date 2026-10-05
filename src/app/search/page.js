"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import styles from "./search.module.css";
import { useSearch } from "@/hooks/useSearch";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const {
    query,
    results,
    loading,
    error,
    hasSearched,
    hasResults,
    isEmpty,
    clear,
    search,
    setQuery,
  } = useSearch(initialQuery);

  // Mantém o input sincronizado quando a URL muda (ex.: nova busca pelo Header)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, setQuery]);

  // Reflete o termo digitado de volta na URL (busca compartilhável / voltar-avançar)
  // sem recarregar a página. O Next 15 integra replaceState com useSearchParams.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if ((params.get("q") ?? "") === query) return;

    if (query) params.set("q", query);
    else params.delete("q");

    const queryString = params.toString();
    window.history.replaceState(
      null,
      "",
      queryString ? `/search?${queryString}` : "/search"
    );
  }, [query, searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔍 Buscar Produtos</h1>
        <p>Encontre o que você procura em nosso catálogo</p>
      </div>

      <div className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <Input
            variant="search"
            placeholder="Digite o nome do produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <Button
              onClick={clear}
              variant="ghost"
              size="small"
              className={styles.clearButton}
              aria-label="Limpar busca"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      <div className={styles.searchStatus}>
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner}></span>
            <span>Buscando produtos...</span>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <span>⚠️ {error}</span>
            <Button onClick={() => search(query)} variant="danger" size="small">
              Tentar novamente
            </Button>
          </div>
        )}

        {hasSearched && !loading && hasResults && (
          <div className={styles.resultCount}>
            <span>✅ {results.length} produto(s) encontrado(s)</span>
          </div>
        )}

        {isEmpty && (
          <div className={styles.noResults}>
            <span>🔍 Nenhum produto encontrado para &quot;{query}&quot;</span>
            <p>Tente buscar por:</p>
            <ul>
              <li>Termos mais genéricos</li>
              <li>Categoria diferente</li>
              <li>Verificar a ortografia</li>
            </ul>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.results}>
          <div className={styles.productsGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {!loading && hasResults && (
        <div className={styles.results}>
          <div className={styles.productsGrid}>
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Estado inicial (sem busca) */}
      {!hasSearched && !loading && (
        <div className={styles.welcomeState}>
          <div className={styles.welcomeIcon}>🔍</div>
          <h2>Comece a digitar para buscar</h2>
          <p>Digite pelo menos 2 caracteres para ver os resultados</p>
          <div className={styles.searchTips}>
            <h3>💡 Dicas:</h3>
            <ul>
              <li>Use palavras-chave relacionadas ao produto</li>
              <li>A busca é automática conforme você digita</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
