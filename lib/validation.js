import { z } from "zod";

// Helpers ---------------------------------------------------------------

// Converte os searchParams (URLSearchParams) em objeto e valida com o schema.
export const parseQuery = (schema, searchParams) =>
  schema.safeParse(Object.fromEntries(searchParams.entries()));

// Query params ----------------------------------------------------------

export const productsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(48).default(6),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const searchQuerySchema = z.object({
  // busca é tolerante: apenas limita o tamanho; termos < 2 são tratados na rota
  q: z.string().max(100).optional().default(""),
});

export const reviewsQuerySchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const ordersQuerySchema = z.object({
  email: z.string().trim().email().max(160),
});

// Catálogo (página /produtos) — resiliente: ignora valores inválidos na URL
export const catalogQuerySchema = z.object({
  categoria: z.coerce.number().int().positive().optional().catch(undefined),
  cor: z.string().max(40).optional().catch(undefined),
  tamanho: z.string().max(20).optional().catch(undefined),
  precoMin: z.coerce.number().nonnegative().optional().catch(undefined),
  precoMax: z.coerce.number().nonnegative().optional().catch(undefined),
  ordenar: z
    .enum(["featured", "recent", "price_asc", "price_desc"])
    .catch("featured"),
  pagina: z.coerce.number().int().min(1).catch(1),
});

// Bodies ----------------------------------------------------------------

export const reviewBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  author: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().default(""),
});

// O cliente envia apenas a identificação do item; nome, preço e total são
// recalculados no servidor a partir do banco (evita adulteração de preço).
const orderItemSchema = z.object({
  id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(999),
  color: z.string().max(60).nullable().optional(),
  size: z.string().max(20).nullable().optional(),
});

export const orderBodySchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().email().max(160),
  address: z.string().trim().max(200).optional().default(""),
  items: z.array(orderItemSchema).min(1).max(100),
  coupon: z.string().trim().max(40).optional(),
});
