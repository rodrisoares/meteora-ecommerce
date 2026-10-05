import { describe, it, expect } from "vitest";
import { evaluateCoupon } from "./coupons";

describe("evaluateCoupon", () => {
  it("retorna inválido (sem erro) quando não há código", () => {
    const r = evaluateCoupon("", 100);
    expect(r.valid).toBe(false);
    expect(r.discount).toBe(0);
    expect(r.code).toBe(null);
  });

  it("rejeita código inexistente", () => {
    const r = evaluateCoupon("NAOEXISTE", 100);
    expect(r.valid).toBe(false);
    expect(r.discount).toBe(0);
  });

  it("aplica o percentual e normaliza o código (case-insensitive)", () => {
    const r = evaluateCoupon("meteora10", 100);
    expect(r.valid).toBe(true);
    expect(r.code).toBe("METEORA10");
    expect(r.percent).toBe(10);
    expect(r.discount).toBe(10);
  });

  it("respeita o subtotal mínimo do cupom", () => {
    const r = evaluateCoupon("BEMVINDO15", 100); // exige 150
    expect(r.valid).toBe(false);
    expect(r.discount).toBe(0);
  });

  it("aplica quando o subtotal atinge o mínimo", () => {
    const r = evaluateCoupon("BEMVINDO15", 200);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(30);
  });

  it("arredonda o desconto para 2 casas", () => {
    const r = evaluateCoupon("METEORA10", 127.5);
    expect(r.discount).toBe(12.75);
  });
});
