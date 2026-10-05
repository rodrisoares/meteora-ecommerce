import { describe, it, expect } from "vitest";
import { catalogQuerySchema, orderBodySchema } from "./validation";

describe("catalogQuerySchema", () => {
  it("aplica os defaults quando o objeto está vazio", () => {
    const r = catalogQuerySchema.parse({});
    expect(r.ordenar).toBe("featured");
    expect(r.pagina).toBe(1);
    expect(r.categoria).toBeUndefined();
  });

  it("ignora valores inválidos via .catch (resiliente)", () => {
    const r = catalogQuerySchema.parse({
      categoria: "abc",
      ordenar: "xpto",
      pagina: "-5",
    });
    expect(r.categoria).toBeUndefined();
    expect(r.ordenar).toBe("featured");
    expect(r.pagina).toBe(1);
  });

  it("coage números válidos vindos da URL", () => {
    const r = catalogQuerySchema.parse({
      categoria: "3",
      precoMin: "10",
      pagina: "2",
    });
    expect(r.categoria).toBe(3);
    expect(r.precoMin).toBe(10);
    expect(r.pagina).toBe(2);
  });
});

describe("orderBodySchema", () => {
  it("aceita pedido com itens mínimos (id + quantity)", () => {
    const r = orderBodySchema.safeParse({
      customerName: "Ana",
      customerEmail: "ana@example.com",
      items: [{ id: 1, quantity: 2 }],
    });
    expect(r.success).toBe(true);
  });

  it("rejeita pedido sem itens", () => {
    const r = orderBodySchema.safeParse({
      customerName: "Ana",
      customerEmail: "ana@example.com",
      items: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const r = orderBodySchema.safeParse({
      customerName: "Ana",
      customerEmail: "invalido",
      items: [{ id: 1, quantity: 1 }],
    });
    expect(r.success).toBe(false);
  });

  it("aceita cupom opcional", () => {
    const r = orderBodySchema.safeParse({
      customerName: "Ana",
      customerEmail: "ana@example.com",
      items: [{ id: 1, quantity: 1 }],
      coupon: "METEORA10",
    });
    expect(r.success).toBe(true);
  });
});
