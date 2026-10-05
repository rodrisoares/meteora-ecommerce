import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocka o driver do banco: os testes não tocam no PostgreSQL de verdade.
vi.mock("./db", () => ({
  query: vi.fn(),
}));

import { query } from "./db";
import {
  fetchProductsBySearch,
  fetchProductsCatalog,
  fetchRelatedProducts,
  fetchProductsOnSale,
  createOrder,
} from "./data-layer";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchProductsBySearch", () => {
  it("retorna [] para termo com menos de 2 caracteres sem consultar o banco", async () => {
    const result = await fetchProductsBySearch("a");
    expect(result).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it("consulta o banco para um termo válido", async () => {
    query.mockResolvedValueOnce([{ id: 1, name: "Camiseta conforto" }]);

    const result = await fetchProductsBySearch("camiseta");

    expect(query).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1, name: "Camiseta conforto" }]);
  });
});

describe("fetchProductsCatalog", () => {
  it("calcula a paginação e remove totalCount dos itens", async () => {
    query.mockResolvedValueOnce([
      { id: 1, name: "A", totalCount: "12" },
      { id: 2, name: "B", totalCount: "12" },
    ]);

    const result = await fetchProductsCatalog({ pageSize: 9, page: 1 });

    expect(result.totalCount).toBe(12);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(1);
    expect(result.products).toHaveLength(2);
    expect(result.products[0]).not.toHaveProperty("totalCount");
  });

  it("limita o pageSize ao máximo permitido (48)", async () => {
    query.mockResolvedValueOnce([]);

    await fetchProductsCatalog({ pageSize: 9999 });

    // O último bloco de params é [pageSize, offset]
    const params = query.mock.calls[0][1];
    expect(params).toContain(48);
  });

  it("aplica o filtro de categoria como condição parametrizada", async () => {
    query.mockResolvedValueOnce([]);

    await fetchProductsCatalog({ categoryId: 3 });

    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('p."categoryId"');
    expect(params).toContain(3);
  });
});

describe("fetchRelatedProducts", () => {
  it("retorna [] quando não há categoria, sem consultar o banco", async () => {
    const result = await fetchRelatedProducts(1, null);
    expect(result).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("fetchProductsOnSale", () => {
  it("filtra por desconto e calcula a paginação", async () => {
    query.mockResolvedValueOnce([
      { id: 1, name: "A", discountPercent: 20, totalCount: "3" },
      { id: 2, name: "B", discountPercent: 10, totalCount: "3" },
    ]);

    const result = await fetchProductsOnSale({ page: 1, pageSize: 2 });

    const [sql] = query.mock.calls[0];
    expect(sql).toContain('"discountPercent" > 0');
    expect(result.totalCount).toBe(3);
    expect(result.totalPages).toBe(2);
    expect(result.products).toHaveLength(2);
    expect(result.products[0]).not.toHaveProperty("totalCount");
  });
});

describe("createOrder (recompute no servidor)", () => {
  it("usa o preço do banco (finalPrice) e ignora qualquer preço do cliente", async () => {
    // 1ª query: fetchProductsByIds  | 2ª query: INSERT do pedido
    query
      .mockResolvedValueOnce([
        { id: 1, name: "Camiseta", price: "100.00", discountPercent: 20, finalPrice: "80.00" },
      ])
      .mockResolvedValueOnce([{ id: 99, total: "160.00", items: [] }]);

    const result = await createOrder({
      customerName: "Ana",
      customerEmail: "ana@example.com",
      address: "Rua X",
      // Cliente tenta forjar preço/nome — devem ser ignorados
      items: [{ id: 1, quantity: 2, price: 1, name: "hack" }],
    });

    const insertParams = query.mock.calls[1][1];
    const itemsJson = JSON.parse(insertParams[3]);
    const total = insertParams[4];

    expect(itemsJson[0].price).toBe(80); // preço do banco
    expect(itemsJson[0].name).toBe("Camiseta"); // nome do banco
    expect(total).toBe(160); // 80 * 2
    expect(result.subtotal).toBe(160);
    expect(result.discount).toBe(0);
  });

  it("aplica cupom válido sobre o subtotal recalculado", async () => {
    query
      .mockResolvedValueOnce([
        { id: 1, name: "Item", price: "100.00", discountPercent: 0, finalPrice: "100.00" },
      ])
      .mockResolvedValueOnce([{ id: 100, total: "90.00", items: [] }]);

    const result = await createOrder({
      customerName: "Ana",
      customerEmail: "ana@example.com",
      items: [{ id: 1, quantity: 1 }],
      coupon: "METEORA10",
    });

    const insertParams = query.mock.calls[1][1];
    expect(insertParams[4]).toBe(90); // 100 - 10%
    expect(result.discount).toBe(10);
    expect(result.couponCode).toBe("METEORA10");
  });

  it("recusa o pedido quando algum item não existe/está inativo", async () => {
    query.mockResolvedValueOnce([]); // fetchProductsByIds não encontra nada

    await expect(
      createOrder({
        customerName: "Ana",
        customerEmail: "ana@example.com",
        items: [{ id: 1, quantity: 1 }],
      })
    ).rejects.toMatchObject({ code: "ITEMS_UNAVAILABLE" });

    // Não deve chegar ao INSERT
    expect(query).toHaveBeenCalledTimes(1);
  });
});
