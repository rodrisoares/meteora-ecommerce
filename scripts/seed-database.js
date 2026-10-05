#!/usr/bin/env node

/**
 * 🌱 Script de Seed - Meteora Store
 *
 * Popula o banco PostgreSQL local com dados iniciais
 *
 * Uso:
 * npm run seed
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));

// 🔑 Configuração PostgreSQL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Erro: variável de ambiente DATABASE_URL não encontrada!");
  console.log("📝 Certifique-se de que .env.local contém:");
  console.log("   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meteora");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString });

// Dados para seed
const categorias = [
  {
    name: "Camisetas",
    imageSrc:
      "/assets/categorias/camiseta.png",
  },
  {
    name: "Bolsas",
    imageSrc:
      "/assets/categorias/bolsa.png",
  },
  {
    name: "Calçados",
    imageSrc:
      "/assets/categorias/tenis.png",
  },
  {
    name: "Calças",
    imageSrc:
      "/assets/categorias/calca.png",
  },
  {
    name: "Casacos",
    imageSrc:
      "/assets/categorias/casaco.png",
  },
  {
    name: "Óculos",
    imageSrc:
      "/assets/categorias/oculos.png",
  },
];

const produtos = [
  {
    name: "Camiseta conforto",
    colors: [{ hexa: "#b39628", name: "Mostarda" }],
    price: 70.0,
    sizes: ["P", "PP", "M", "G", "GG"],
    imageSrc:
      "/assets/produtos/camiseta-conforto.jpeg",
    description:
      "Multicores e tamanhos. Tecido de algodão 100%, fresquinho para o verão. Modelagem unissex.",
    categoryName: "Camisetas",
    isFeatured: true,
  },
  {
    name: "Calça Alfaiataria",
    colors: [{ hexa: "#ebe2c2", name: "Creme" }],
    price: 180.0,
    sizes: ["P", "PP", "M", "G", "GG"],
    imageSrc:
      "/assets/produtos/calca-alfaitaria.jpeg",
    description:
      "Snicker casual com solado mais alto e modelagem robusta. Modelo unissex.",
    categoryName: "Calças",
    isFeatured: true,
  },
  {
    name: "Tênis Chunky",
    colors: [{ hexa: "#ffffff", name: "Branco" }],
    price: 50.0,
    sizes: ["35", "36", "37", "38", "39"],
    imageSrc:
      "/assets/produtos/tenis-chunky.jpeg",
    description:
      "Snicker casual com solado mais alto e modelagem robusta. Modelo unissex.",
    categoryName: "Calçados",
    isFeatured: true,
    discountPercent: 20,
  },
  {
    name: "Jaqueta Jeans",
    colors: [
      { hexa: "#112d96", name: "Azul" },
      { hexa: "#fefffe", name: "OffWhite" },
      { hexa: "#000000", name: "Preto" },
    ],
    price: 150.0,
    sizes: ["P", "PP", "M", "G", "GG"],
    imageSrc:
      "/assets/produtos/jaqueta-jeans.jpeg",
    description:
      "Modelo unissex oversized com gola de camurça. Atemporal e autêntica!",
    categoryName: "Casacos",
    isFeatured: false,
    discountPercent: 15,
  },
  {
    name: "Óculos Redondo",
    colors: [
      { hexa: "#fefffe", name: "OffWhite" },
      { hexa: "#000000", name: "Preto" },
    ],
    price: 120.0,
    sizes: ["Único"],
    imageSrc:
      "/assets/produtos/oculos-redondo.jpeg",
    description:
      "Armação metálica em grafite com lentes arredondadas. Sem erro!",
    categoryName: "Óculos",
    isFeatured: false,
    discountPercent: 30,
  },
  {
    name: "Bolsa coringa",
    colors: [{ hexa: "#c65038", name: "Castanho" }],
    price: 120.0,
    sizes: ["Único"],
    imageSrc:
      "/assets/produtos/bolsa-coringa.jpeg",
    description:
      "Bolsa camel em couro sintético de alta duração. Ideal para acompanhar você por uma vida!",
    categoryName: "Bolsas",
    isFeatured: false,
  },
];

// Avaliações de exemplo (referenciam produtos pelo nome)
const reviews = [
  {
    productName: "Camiseta conforto",
    author: "Marina S.",
    rating: 5,
    comment: "Tecido super macio e caimento ótimo. Compraria de novo!",
  },
  {
    productName: "Camiseta conforto",
    author: "João P.",
    rating: 4,
    comment: "Boa qualidade, mas veio um pouco maior que o esperado.",
  },
  {
    productName: "Tênis Chunky",
    author: "Beatriz L.",
    rating: 5,
    comment: "Confortável e estiloso, recebi vários elogios.",
  },
  {
    productName: "Jaqueta Jeans",
    author: "Carlos M.",
    rating: 4,
    comment: "Peça atemporal, ótimo acabamento.",
  },
  {
    productName: "Bolsa coringa",
    author: "Fernanda R.",
    rating: 3,
    comment: "Bonita, mas menor do que imaginei pelas fotos.",
  },
];

// 🚀 Funções principais
async function criarTabelas() {
  console.log("🏗️ Garantindo o schema (tabelas)...");

  const schemaPath = resolve(__dirname, "create-tables-camelcase.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");

  await pool.query(schemaSql);

  console.log("✅ Schema aplicado com sucesso!");
}

async function inserirCategorias() {
  console.log("📂 Inserindo categorias...");

  const categoriaMap = {};

  for (const cat of categorias) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, "imageSrc")
       VALUES ($1, $2)
       RETURNING id, name`,
      [cat.name, cat.imageSrc]
    );
    categoriaMap[rows[0].name] = rows[0].id;
  }

  console.log(`✅ ${categorias.length} categorias inseridas com sucesso!`);
  return categoriaMap;
}

async function inserirProdutos(categoriaMap) {
  console.log("🛍️ Inserindo produtos...");

  const produtoMap = {};

  for (const produto of produtos) {
    const { rows } = await pool.query(
      `INSERT INTO products
        (name, description, price, "imageSrc", colors, sizes, "categoryId", "isFeatured", "discountPercent", "isActive")
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, true)
       RETURNING id, name`,
      [
        produto.name,
        produto.description,
        produto.price,
        produto.imageSrc,
        JSON.stringify(produto.colors),
        JSON.stringify(produto.sizes),
        categoriaMap[produto.categoryName],
        produto.isFeatured,
        produto.discountPercent ?? 0,
      ]
    );
    produtoMap[rows[0].name] = rows[0].id;
  }

  console.log(`✅ ${produtos.length} produtos inseridos com sucesso!`);
  return produtoMap;
}

async function inserirReviews(produtoMap) {
  console.log("⭐ Inserindo avaliações...");

  for (const review of reviews) {
    const productId = produtoMap[review.productName];
    if (!productId) continue;

    await pool.query(
      `INSERT INTO reviews ("productId", author, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [productId, review.author, review.rating, review.comment]
    );
  }

  console.log(`✅ ${reviews.length} avaliações inseridas com sucesso!`);
}

async function verificarDados() {
  console.log("🔍 Verificando dados inseridos...\n");

  const { rows: categorias } = await pool.query("SELECT * FROM categories");
  const { rows: produtos } = await pool.query("SELECT * FROM products");

  console.log(`📊 Resumo:`);
  console.log(`   📂 Categorias: ${categorias?.length || 0}`);
  console.log(`   🛍️ Produtos: ${produtos?.length || 0}`);
  console.log(
    `   ⭐ Em destaque: ${produtos?.filter((p) => p.isFeatured).length || 0}\n`
  );

  if (categorias?.length > 0) {
    console.log("📂 Categorias criadas:");
    categorias.forEach((cat) => console.log(`   • ${cat.name}`));
  }

  if (produtos?.length > 0) {
    console.log("\n🛍️ Produtos criados:");
    produtos.forEach((prod) => {
      const destaque = prod.isFeatured ? " ⭐" : "";
      console.log(`   • ${prod.name} - ${prod.price}${destaque}`);
    });
  }
}

// 🎯 Execução principal
async function executarSeed() {
  try {
    console.log("🌱 INICIANDO SEED DO METEORA STORE\n");
    console.log("🔗 Banco:", connectionString.replace(/:[^:@/]+@/, ":****@"), "\n");

    await criarTabelas();
    const categoriaMap = await inserirCategorias();
    const produtoMap = await inserirProdutos(categoriaMap);
    await inserirReviews(produtoMap);
    await verificarDados();

    console.log("\n🎉 SEED CONCLUÍDO COM SUCESSO!");
    console.log("🚀 Agora você pode testar suas APIs:\n");
    console.log("   📂 Categorias: http://localhost:3000/api/categories");
    console.log("   🛍️ Produtos: http://localhost:3000/api/products");
    console.log(
      "   ⭐ Em destaque: http://localhost:3000/api/products?featured=true\n"
    );
  } catch (error) {
    console.error("\n💥 ERRO NO SEED:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

// 🚀 Executar se chamado diretamente (compatível com Windows/Unix)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  executarSeed();
}

export { executarSeed };
