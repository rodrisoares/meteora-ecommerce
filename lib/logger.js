// Logger estruturado simples para padronizar mensagens no servidor.
// Uso: logger.error("api:orders", "Falha ao criar pedido", { err });
// Mantém tudo em um só lugar para depois plugar um serviço externo se preciso.
const emit = (level, scope, message, meta) => {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level.toUpperCase()} (${scope}) ${message}`;

  const fn =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (meta !== undefined) fn(line, meta);
  else fn(line);
};

export const logger = {
  info: (scope, message, meta) => emit("info", scope, message, meta),
  warn: (scope, message, meta) => emit("warn", scope, message, meta),
  error: (scope, message, meta) => emit("error", scope, message, meta),
};
