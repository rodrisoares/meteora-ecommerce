// Formatação de valores monetários no padrão brasileiro (R$)
// Obs.: o driver `pg` retorna colunas NUMERIC como string (ex.: "129.90"),
// por isso normalizamos para número antes de formatar.
export const formatPrice = (value) => {
  const number = typeof value === "string" ? Number(value) : value;

  if (number == null || Number.isNaN(number)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};
