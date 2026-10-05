-- 🔎 Extensões para busca sem acento (unaccent) e fuzzy/typo-tolerante (pg_trgm)
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Wrapper IMMUTABLE de unaccent (necessário para poder indexar a expressão)
CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
AS $$
  SELECT unaccent('unaccent', $1)
$$;

-- 🗑️ Dropar tabelas existentes (cascade para remover dependências)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 🏗️ Tabela categories (colunas em camelCase COM ASPAS DUPLAS)
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "imageSrc" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 🏗️ Tabela products (colunas em camelCase COM ASPAS DUPLAS)
-- Obs.: price agora é NUMERIC (valor cru, ex.: 70.00) para permitir
-- filtro por faixa de preço e ordenação numérica. A formatação "R$ 70,00"
-- é feita na camada de apresentação (lib/format.js).
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  "imageSrc" TEXT,
  colors JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  "categoryId" BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  "isFeatured" BOOLEAN DEFAULT false,
  -- Percentual de desconto (0 = sem promoção). Alimenta a tela /promocoes.
  "discountPercent" SMALLINT NOT NULL DEFAULT 0 CHECK ("discountPercent" BETWEEN 0 AND 90),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

--  Índices para performance (COM ASPAS DUPLAS)
CREATE INDEX "idx_products_categoryId" ON products("categoryId");
CREATE INDEX "idx_products_isFeatured" ON products("isFeatured");
CREATE INDEX "idx_products_isActive" ON products("isActive");

-- Índice parcial para a listagem de promoções (apenas itens com desconto)
CREATE INDEX "idx_products_discount"
  ON products ("discountPercent") WHERE "discountPercent" > 0;

--  Índices GIN de trigramas (sem acento) para a busca fuzzy
CREATE INDEX "idx_products_name_trgm"
  ON products USING gin (f_unaccent(name) gin_trgm_ops);
CREATE INDEX "idx_products_description_trgm"
  ON products USING gin (f_unaccent(description) gin_trgm_ops);

-- ⚡ Índice composto para o listing padrão do catálogo
-- (WHERE "isActive" ORDER BY "isFeatured" DESC, "createdAt" DESC)
CREATE INDEX "idx_products_active_featured_created"
  ON products ("isActive", "isFeatured" DESC, "createdAt" DESC);

-- 🗑️ Dropar tabelas dependentes (avaliações e pedidos)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- ⭐ Tabela reviews (avaliações dos produtos)
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  "productId" BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX "idx_reviews_productId" ON reviews("productId");

-- 🧾 Tabela orders (pedidos do checkout)
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX "idx_orders_customerEmail" ON orders("customerEmail");
