"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "meteora:cart";

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de <CartProvider>");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Carrega o carrinho salvo no localStorage (só no cliente)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (error) {
      console.error("Erro ao ler carrinho:", error);
    }
    setHydrated(true);
  }, []);

  // Persiste sempre que o carrinho muda
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product, options = {}) => {
    const { color = null, size = null, quantity = 1 } = options;
    // Mesma combinação produto+cor+tamanho é agrupada
    const key = `${product.id}::${color ?? ""}::${size ?? ""}`;

    // Cobra o preço já com desconto quando o produto está em promoção.
    // `finalPrice` vem do data-layer (= price quando não há desconto).
    const unitPrice = Number(product.finalPrice ?? product.price);

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: unitPrice,
          imageSrc: product.imageSrc,
          color,
          size,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.key !== key)
        : prev.map((item) =>
            item.key === key ? { ...item, quantity } : item
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      count,
      total,
      hydrated,
    }),
    [items, addItem, removeItem, updateQuantity, clear, count, total, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
