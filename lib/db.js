import pg from "pg";
import { DatabaseConnectionError, isConnectionError } from "./errors";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Faltando configurar a variável de ambiente DATABASE_URL (PostgreSQL local)!"
  );
}

// Pool global reutilizado entre requisições (evita esgotar conexões no dev do Next)
const globalForDb = globalThis;

export const pool =
  globalForDb.__meteoraPool ??
  new Pool({
    connectionString,
    max: 10, // máximo de conexões simultâneas
    idleTimeoutMillis: 30_000, // encerra conexões ociosas após 30s
    connectionTimeoutMillis: 5_000, // falha se não conectar em 5s
    statement_timeout: 10_000, // aborta queries que passem de 10s
    query_timeout: 10_000,
  });

if (!globalForDb.__meteoraPool) {
  globalForDb.__meteoraPool = pool;

  // Um erro em um cliente ocioso (ex.: conexão derrubada pelo servidor) emite
  // 'error' no pool. Sem este handler o processo do Node cairia.
  pool.on("error", (err) => {
    console.error("Erro inesperado no pool do PostgreSQL:", err);
  });
}

// Helper simples: retorna as linhas do resultado
export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    // Falha de conexão (banco fora do ar): loga o erro técnico para o
    // desenvolvedor e propaga uma versão amigável, com mensagem e `digest`
    // que a camada de UI consegue exibir/identificar.
    if (isConnectionError(error)) {
      console.error("Falha de conexão com o PostgreSQL:", error);
      throw new DatabaseConnectionError(undefined, { cause: error });
    }
    // Demais erros (SQL inválido, etc.) seguem para o chamador sem alteração.
    throw error;
  }
};
