// Cupons de desconto (estáticos — sem tabela no banco).
// Percentual aplicado sobre o subtotal (que já considera as promoções por produto).
// Módulo puro: pode ser usado tanto no servidor (autoritativo) quanto no client (preview).
import { formatPrice } from "./format";

export const COUPONS = {
  METEORA10: { percent: 10, minSubtotal: 0, label: "10% de desconto" },
  BEMVINDO15: { percent: 15, minSubtotal: 150, label: "15% em compras acima de R$ 150" },
  METEORA50: { percent: 50, minSubtotal: 300, label: "50% em compras acima de R$ 300" },
};

// Avalia um cupom para um dado subtotal.
// Retorna { valid, code, percent, discount, message }.
export const evaluateCoupon = (rawCode, subtotal) => {
  if (!rawCode || !String(rawCode).trim()) {
    return { valid: false, code: null, percent: 0, discount: 0, message: "" };
  }

  const code = String(rawCode).trim().toUpperCase();
  const coupon = COUPONS[code];

  if (!coupon) {
    return {
      valid: false,
      code,
      percent: 0,
      discount: 0,
      message: "Cupom inválido.",
    };
  }

  if (subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      code,
      percent: coupon.percent,
      discount: 0,
      message: `Este cupom exige subtotal mínimo de ${formatPrice(
        coupon.minSubtotal
      )}.`,
    };
  }

  // Desconto arredondado para 2 casas
  const discount = Math.round(subtotal * coupon.percent) / 100;

  return {
    valid: true,
    code,
    percent: coupon.percent,
    discount,
    message: `Cupom ${code} aplicado (${coupon.percent}% • -${formatPrice(
      discount
    )}).`,
  };
};
