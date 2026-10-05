// Rate limiter in-memory (janela fixa por chave).
//
// ⚠️ Limitação: o estado vive na memória do processo. Em ambientes
// serverless/multi-instância o limite é por instância, não global. Para
// produção use um store compartilhado (Redis/Upstash). Para o projeto local
// (dev/self-hosted) resolve bem.

const buckets = new Map();
const MAX_BUCKETS = 10_000;

/**
 * @param {{ key: string, limit?: number, windowMs?: number }} options
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export const rateLimit = ({ key, limit = 30, windowMs = 10_000 }) => {
  const now = Date.now();
  const entry = buckets.get(key);

  // Nova janela (ou primeira requisição da chave)
  if (!entry || now > entry.resetAt) {
    // Poda simples para evitar crescimento ilimitado do Map
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, v] of buckets) {
        if (now > v.resetAt) buckets.delete(k);
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
};

// Extrai um identificador do cliente a partir dos headers da requisição
export const getClientKey = (request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwarded?.split(",")[0] ?? realIp ?? "local").trim();
  return ip || "local";
};
