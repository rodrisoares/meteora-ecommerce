"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_ENDPOINTS } from "../../lib/config";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export const useSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Guarda a requisição em andamento para poder cancelá-la (evita race condition)
  const abortRef = useRef(null);

  const runSearch = useCallback(async (searchTerm) => {
    const term = (searchTerm ?? "").trim();

    // Cancela qualquer busca anterior ainda pendente
    abortRef.current?.abort();

    if (term.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(term)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        // Aproveita a mensagem amigável enviada pela API (ex.: 503 banco fora)
        const body = await response.json().catch(() => null);
        const err = new Error(body?.error || `Erro na busca: ${response.status}`);
        err.serverMessage = body?.error ?? null;
        throw err;
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      // Busca cancelada por uma nova digitação: ignora silenciosamente
      if (err.name === "AbortError") {
        return;
      }
      console.error("Erro na busca:", err);
      setError(err.serverMessage || "Erro ao buscar produtos. Tente novamente.");
      setResults([]);
    } finally {
      // Só desliga o loading se esta ainda for a requisição mais recente
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  // Busca automática com debounce conforme o usuário digita
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const search = useCallback(
    (searchTerm = query) => runSearch(searchTerm),
    [query, runSearch]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  const hasResults = results.length > 0;
  const isEmpty = hasSearched && !loading && !hasResults && !error;

  return {
    query,
    results,
    loading,
    error,
    hasSearched,
    isEmpty,
    hasResults,
    setQuery,
    search,
    clear,
  };
};
