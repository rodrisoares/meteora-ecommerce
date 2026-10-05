// Erros de domínio compartilhados entre o servidor (data-layer / rotas de API)
// e o client (error boundary). Este módulo NÃO importa 'pg' nem lê variáveis de
// ambiente de propósito, para poder ser importado com segurança no bundle do client.

// O Next.js mascara a `message` dos erros de render em produção, mas preserva e
// encaminha a propriedade `digest` até o error.js. Usamos um digest estável para
// identificar "banco indisponível" tanto em dev quanto em produção.
export const DB_CONNECTION_ERROR_DIGEST = "DATABASE_CONNECTION_ERROR";

export const DB_CONNECTION_ERROR_MESSAGE =
  "Não foi possível conectar ao banco de dados. Tente novamente em instantes.";

// Erro amigável lançado quando a conexão com o PostgreSQL falha.
export class DatabaseConnectionError extends Error {
  constructor(message = DB_CONNECTION_ERROR_MESSAGE, options = {}) {
    super(message, options);
    this.name = "DatabaseConnectionError";
    // Encaminhado pelo Next ao error boundary (inclusive em produção).
    this.digest = DB_CONNECTION_ERROR_DIGEST;
  }
}

// Códigos de falha de conexão: rede (Node/libpq) + PostgreSQL (SQLSTATE classe 08
// "connection exception" e 57Pxx "operator intervention").
const CONNECTION_ERROR_CODES = new Set([
  // Rede
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  // PostgreSQL — connection exception (classe 08)
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  // PostgreSQL — operator intervention (57Pxx)
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
]);

// Identifica se um erro (do driver pg / rede) representa uma falha de conexão.
export const isConnectionError = (error) => {
  if (!error) return false;

  if (error instanceof DatabaseConnectionError) return true;

  if (error.code && CONNECTION_ERROR_CODES.has(error.code)) return true;

  // Timeout do pool ao tentar obter conexão (não traz `code`, apenas mensagem).
  if (
    typeof error.message === "string" &&
    error.message.includes("timeout exceeded when trying to connect")
  ) {
    return true;
  }

  // ECONNREFUSED normalmente vem embrulhado num AggregateError (vários endereços).
  if (Array.isArray(error.errors)) {
    return error.errors.some((inner) => isConnectionError(inner));
  }

  return false;
};
