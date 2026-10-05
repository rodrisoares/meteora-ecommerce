"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "meteora:wishlist";

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist deve ser usado dentro de <WishlistProvider>");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (error) {
      console.error("Erro ao ler favoritos:", error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Erro ao salvar favoritos:", error);
    }
  }, [items, hydrated]);

  const has = useCallback(
    (id) => items.some((item) => item.id === id),
    [items]
  );

  const toggle = useCallback((product) => {
    setItems((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              imageSrc: product.imageSrc,
              description: product.description,
              isFeatured: product.isFeatured,
              ratingAvg: product.ratingAvg,
              ratingCount: product.ratingCount,
            },
          ]
    );
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, has, toggle, remove, count: items.length, hydrated }),
    [items, has, toggle, remove, hydrated]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
