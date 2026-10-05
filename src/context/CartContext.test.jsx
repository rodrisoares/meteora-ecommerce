import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext addItem", () => {
  it("usa finalPrice (preço com desconto) como preço unitário", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(
        { id: 1, name: "X", price: "100.00", finalPrice: "80.00", imageSrc: "" },
        { quantity: 2 }
      );
    });

    expect(result.current.items[0].price).toBe(80);
    expect(result.current.total).toBe(160);
    expect(result.current.count).toBe(2);
  });

  it("cai para price quando não há finalPrice", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ id: 2, name: "Y", price: "50.00", imageSrc: "" });
    });

    expect(result.current.items[0].price).toBe(50);
  });

  it("agrupa a mesma combinação produto+cor+tamanho somando a quantidade", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const produto = { id: 3, name: "Z", price: "10", finalPrice: "10" };

    act(() => {
      result.current.addItem(produto, { quantity: 1, color: "Azul", size: "M" });
    });
    act(() => {
      result.current.addItem(produto, { quantity: 2, color: "Azul", size: "M" });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });
});
