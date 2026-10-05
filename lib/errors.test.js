import { describe, it, expect } from "vitest";
import {
  isConnectionError,
  DatabaseConnectionError,
  DB_CONNECTION_ERROR_DIGEST,
  DB_CONNECTION_ERROR_MESSAGE,
} from "./errors";

describe("isConnectionError", () => {
  it("retorna false para valores nulos/indefinidos", () => {
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError(undefined)).toBe(false);
  });

  it("identifica um DatabaseConnectionError", () => {
    expect(isConnectionError(new DatabaseConnectionError())).toBe(true);
  });

  it("identifica códigos de rede (Node/libpq)", () => {
    for (const code of [
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "ECONNRESET",
      "EHOSTUNREACH",
      "ENETUNREACH",
      "EPIPE",
    ]) {
      const err = Object.assign(new Error("falha de rede"), { code });
      expect(isConnectionError(err)).toBe(true);
    }
  });

  it("identifica códigos de conexão do PostgreSQL (classe 08 e 57Pxx)", () => {
    for (const code of ["08006", "08001", "08003", "57P01", "57P03"]) {
      const err = Object.assign(new Error("connection exception"), { code });
      expect(isConnectionError(err)).toBe(true);
    }
  });

  it("identifica timeout do pool ao obter conexão (sem code)", () => {
    const err = new Error("timeout exceeded when trying to connect");
    expect(isConnectionError(err)).toBe(true);
  });

  it("identifica ECONNREFUSED embrulhado num AggregateError", () => {
    const inner = Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
    });
    const aggregate = new AggregateError([inner], "todas as tentativas falharam");
    expect(isConnectionError(aggregate)).toBe(true);
  });

  it("retorna false para erros que não são de conexão", () => {
    const syntax = Object.assign(new Error("sintaxe inválida"), {
      code: "42601", // syntax_error do PostgreSQL
    });
    expect(isConnectionError(syntax)).toBe(false);
    expect(isConnectionError(new Error("qualquer outro erro"))).toBe(false);
  });

  it("retorna false para AggregateError sem erro de conexão interno", () => {
    const inner = Object.assign(new Error("erro qualquer"), { code: "42601" });
    const aggregate = new AggregateError([inner]);
    expect(isConnectionError(aggregate)).toBe(false);
  });
});

describe("DatabaseConnectionError", () => {
  it("usa a mensagem amigável padrão e o digest estável", () => {
    const err = new DatabaseConnectionError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("DatabaseConnectionError");
    expect(err.message).toBe(DB_CONNECTION_ERROR_MESSAGE);
    expect(err.digest).toBe(DB_CONNECTION_ERROR_DIGEST);
  });

  it("preserva a causa original quando informada", () => {
    const cause = new Error("ECONNREFUSED");
    const err = new DatabaseConnectionError(undefined, { cause });
    expect(err.cause).toBe(cause);
  });
});
