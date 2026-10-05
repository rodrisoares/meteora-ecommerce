import { query } from "./db";
import { evaluateCoupon } from "./coupons";

// Colunas de produto reutilizadas em várias queries (com a categoria aninhada)
const PRODUCT_COLUMNS = `
  p.id,
  p.name,
  p.description,
  p.price,
  p."imageSrc",
  p.colors,
  p.sizes,
  p."categoryId",
  json_build_object(
    'id', c.id,
    'name', c.name,
    'imageSrc', c."imageSrc"
  ) AS category,
  p."isFeatured",
  p."discountPercent",
  -- Preço final já com o desconto aplicado (2 casas). Sem desconto = price.
  ROUND(p.price * (100 - p."discountPercent") / 100.0, 2) AS "finalPrice",
  COALESCE((SELECT ROUND(AVG(r.rating), 1)
            FROM reviews r WHERE r."productId" = p.id), 0) AS "ratingAvg",
  (SELECT COUNT(*)::int
   FROM reviews r WHERE r."productId" = p.id) AS "ratingCount"
`;

// Ordenações permitidas no catálogo (whitelist para evitar SQL injection no ORDER BY)
const SORT_OPTIONS = {
  featured: `p."isFeatured" DESC, p."createdAt" DESC`,
  recent: `p."createdAt" DESC`,
  price_asc: `p.price ASC`,
  price_desc: `p.price DESC`,
};

// Buscar categories
export const fetchCategories = async () => {
  try {
    const rows = await query(
      `SELECT id, name, "imageSrc"
       FROM categories
       ORDER BY name`
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchCategories:", error);
    throw error;
  }
};

// Buscar produtos (com a categoria aninhada)
export const fetchProducts = async (options = {}) => {
  try {
    const { limit = 6, featuredOnly = false } = options;

    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE p."isActive" = true
         AND ($1::boolean IS NOT TRUE OR p."isFeatured" = true)
       ORDER BY p."isFeatured" DESC, p."createdAt" DESC
       LIMIT $2`,
      [featuredOnly, limit]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchProducts:", error);
    throw error;
  }
};

// Catálogo com filtros, ordenação e paginação.
// Retorna { products, totalCount, page, pageSize, totalPages }.
export const fetchProductsCatalog = async (options = {}) => {
  try {
    const {
      categoryId,
      color,
      size,
      minPrice,
      maxPrice,
      sort = "featured",
      page = 1,
      pageSize = 9,
    } = options;

    const conditions = [`p."isActive" = true`];
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p."categoryId" = $${params.length}`);
    }
    if (color) {
      params.push(JSON.stringify([{ name: color }]));
      conditions.push(`p.colors @> $${params.length}::jsonb`);
    }
    if (size) {
      params.push(size);
      conditions.push(`p.sizes ? $${params.length}`);
    }
    if (minPrice != null) {
      params.push(minPrice);
      conditions.push(`p.price >= $${params.length}`);
    }
    if (maxPrice != null) {
      params.push(maxPrice);
      conditions.push(`p.price <= $${params.length}`);
    }

    const orderBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.featured;

    // Sanitiza paginação (limita o pageSize para não permitir ?pageSize=99999)
    const safePageSize = Math.min(Math.max(parseInt(pageSize) || 9, 1), 48);
    const safePage = Math.max(parseInt(page) || 1, 1);
    const offset = (safePage - 1) * safePageSize;

    params.push(safePageSize);
    const limitParam = params.length;
    params.push(offset);
    const offsetParam = params.length;

    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS},
              COUNT(*) OVER() AS "totalCount"
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE ${conditions.join(" AND ")}
       ORDER BY ${orderBy}
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    const totalCount = rows[0] ? parseInt(rows[0].totalCount) : 0;
    const products = rows.map(({ totalCount: _ignore, ...product }) => product);

    return {
      products,
      totalCount,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(totalCount / safePageSize),
    };
  } catch (error) {
    console.error("Erro no fetchProductsCatalog:", error);
    throw error;
  }
};

// 🔥 Produtos em promoção (com desconto aplicado), paginados.
// Retorna { products, totalCount, page, pageSize, totalPages }.
export const fetchProductsOnSale = async (options = {}) => {
  try {
    const { page = 1, pageSize = 9 } = options;

    const safePageSize = Math.min(Math.max(parseInt(pageSize) || 9, 1), 48);
    const safePage = Math.max(parseInt(page) || 1, 1);
    const offset = (safePage - 1) * safePageSize;

    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS},
              COUNT(*) OVER() AS "totalCount"
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE p."isActive" = true
         AND p."discountPercent" > 0
       ORDER BY p."discountPercent" DESC, p."isFeatured" DESC, p."createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [safePageSize, offset]
    );

    const totalCount = rows[0] ? parseInt(rows[0].totalCount) : 0;
    const products = rows.map(({ totalCount: _ignore, ...product }) => product);

    return {
      products,
      totalCount,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(totalCount / safePageSize),
    };
  } catch (error) {
    console.error("Erro no fetchProductsOnSale:", error);
    throw error;
  }
};

// Opções de filtro disponíveis (cores e tamanhos distintos dos produtos ativos)
export const fetchFilterFacets = async () => {
  try {
    const [colors, sizes] = await Promise.all([
      query(
        `SELECT DISTINCT elem->>'name' AS name, elem->>'hexa' AS hexa
         FROM products p, jsonb_array_elements(p.colors) elem
         WHERE p."isActive" = true
         ORDER BY name`
      ),
      query(
        `SELECT DISTINCT elem AS size
         FROM products p, jsonb_array_elements_text(p.sizes) elem
         WHERE p."isActive" = true
         ORDER BY size`
      ),
    ]);

    return { colors, sizes: sizes.map((row) => row.size) };
  } catch (error) {
    console.error("Erro no fetchFilterFacets:", error);
    throw error;
  }
};

// Buscar produto por ID
export const fetchProductById = async (id) => {
  try {
    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE p.id = $1
         AND p."isActive" = true`,
      [id]
    );

    return rows[0] ?? null;
  } catch (error) {
    console.error("Erro no fetchProductById:", error);
    throw error;
  }
};

// Produtos relacionados ("você também pode gostar"): mesma categoria, exclui o atual
export const fetchRelatedProducts = async (productId, categoryId, limit = 4) => {
  try {
    if (!categoryId) return [];

    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE p."isActive" = true
         AND p."categoryId" = $1
         AND p.id <> $2
       ORDER BY p."isFeatured" DESC, p."createdAt" DESC
       LIMIT $3`,
      [categoryId, productId, limit]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchRelatedProducts:", error);
    throw error;
  }
};

// Buscar produtos por termo de busca.
// Ignora acentos (unaccent) e tolera erros de digitação (pg_trgm),
// pesquisando em nome, descrição e nome da categoria.
export const fetchProductsBySearch = async (searchTerm, options = {}) => {
  try {
    const { limit = 20 } = options;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const raw = searchTerm.trim();
    const like = `%${raw}%`;

    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       LEFT JOIN categories c ON c.id = p."categoryId"
       WHERE p."isActive" = true
         AND (
           f_unaccent(p.name) ILIKE f_unaccent($1)
           OR f_unaccent(p.description) ILIKE f_unaccent($1)
           OR f_unaccent(c.name) ILIKE f_unaccent($1)
           OR f_unaccent(p.name) % f_unaccent($2)
         )
       ORDER BY
         similarity(f_unaccent(p.name), f_unaccent($2)) DESC,
         p."isFeatured" DESC,
         p.name ASC
       LIMIT $3`,
      [like, raw, limit]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchProductsBySearch:", error);
    throw error;
  }
};

// ⭐ Avaliações de um produto
export const fetchReviewsByProduct = async (productId) => {
  try {
    const rows = await query(
      `SELECT id, "productId", author, rating, comment, "createdAt"
       FROM reviews
       WHERE "productId" = $1
       ORDER BY "createdAt" DESC`,
      [productId]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchReviewsByProduct:", error);
    throw error;
  }
};

// ⭐ Melhores avaliações da loja (prova social na home).
// Só traz reviews com nota alta e comentário preenchido, já com o nome do
// produto e imagem para linkar de volta ao detalhe.
export const fetchTopReviews = async (options = {}) => {
  try {
    const { limit = 3, minRating = 4 } = options;

    const rows = await query(
      `SELECT r.id, r.author, r.rating, r.comment, r."createdAt",
              p.id AS "productId", p.name AS "productName", p."imageSrc" AS "productImage"
       FROM reviews r
       JOIN products p ON p.id = r."productId"
       WHERE r.rating >= $1
         AND r.comment IS NOT NULL
         AND length(trim(r.comment)) > 0
         AND p."isActive" = true
       ORDER BY r.rating DESC, r."createdAt" DESC
       LIMIT $2`,
      [minRating, limit]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchTopReviews:", error);
    throw error;
  }
};

// ⭐ Cria uma avaliação (rating 1..5)
export const createReview = async ({ productId, author, rating, comment }) => {
  const rows = await query(
    `INSERT INTO reviews ("productId", author, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, "productId", author, rating, comment, "createdAt"`,
    [productId, author, rating, comment ?? null]
  );

  return rows[0];
};

// Busca produtos ativos por lista de IDs (com preço final já calculado).
// Usado para recomputar o pedido com preços confiáveis do servidor.
export const fetchProductsByIds = async (ids) => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const rows = await query(
      `SELECT id, name, price, "discountPercent",
              ROUND(price * (100 - "discountPercent") / 100.0, 2) AS "finalPrice"
       FROM products
       WHERE id = ANY($1::bigint[]) AND "isActive" = true`,
      [ids]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchProductsByIds:", error);
    throw error;
  }
};

// 🧾 Cria um pedido (checkout).
// SEGURANÇA: o cliente envia apenas { id, quantity, color, size } + coupon.
// O servidor busca cada produto no banco, aplica o desconto de promoção
// (finalPrice), soma o subtotal, aplica o cupom e calcula o total — nunca
// confia em preços vindos do cliente.
export const createOrder = async ({
  customerName,
  customerEmail,
  address,
  items,
  coupon,
}) => {
  const ids = [...new Set(items.map((i) => Number(i.id)))];
  const products = await fetchProductsByIds(ids);
  const byId = new Map(products.map((p) => [Number(p.id), p]));

  // Rejeita o pedido se algum item não existe mais ou está inativo
  const unavailable = items.filter((i) => !byId.has(Number(i.id)));
  if (unavailable.length > 0) {
    const error = new Error(
      "Alguns itens do carrinho não estão mais disponíveis."
    );
    error.code = "ITEMS_UNAVAILABLE";
    throw error;
  }

  // Linhas do pedido com preço confiável (finalPrice = já com desconto do produto)
  const lineItems = items.map((i) => {
    const product = byId.get(Number(i.id));
    return {
      id: Number(product.id),
      name: product.name,
      price: Number(product.finalPrice),
      quantity: i.quantity,
      color: i.color ?? null,
      size: i.size ?? null,
    };
  });

  const subtotal =
    Math.round(
      lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
    ) / 100;

  const couponResult = evaluateCoupon(coupon, subtotal);
  const discount = couponResult.valid ? couponResult.discount : 0;
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  const rows = await query(
    `INSERT INTO orders ("customerName", "customerEmail", address, items, total)
     VALUES ($1, $2, $3, $4::jsonb, $5)
     RETURNING id, "customerName", "customerEmail", address, items, total, status, "createdAt"`,
    [customerName, customerEmail, address ?? null, JSON.stringify(lineItems), total]
  );

  // Devolve o pedido persistido + o resumo (subtotal/desconto/cupom) para a UI.
  return {
    ...rows[0],
    subtotal,
    discount,
    couponCode: couponResult.valid ? couponResult.code : null,
  };
};

// 🧾 Pedidos de um cliente (por e-mail)
export const fetchOrdersByEmail = async (email) => {
  try {
    if (!email) return [];

    const rows = await query(
      `SELECT id, "customerName", "customerEmail", address, items, total, status, "createdAt"
       FROM orders
       WHERE "customerEmail" = $1
       ORDER BY "createdAt" DESC`,
      [email]
    );

    return rows;
  } catch (error) {
    console.error("Erro no fetchOrdersByEmail:", error);
    throw error;
  }
};
