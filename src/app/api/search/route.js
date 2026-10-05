import { fetchProductsBySearch } from "../../../../lib/data-layer";
import { searchQuerySchema, parseQuery } from "../../../../lib/validation";
import { rateLimit, getClientKey } from "../../../../lib/rate-limit";
import {
  isConnectionError,
  DB_CONNECTION_ERROR_MESSAGE,
} from "../../../../lib/errors";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 🚦 Rate limit por cliente (rota pública e dinâmica)
    const { allowed, resetAt } = rateLimit({
      key: `search:${getClientKey(request)}`,
      limit: 30,
      windowMs: 10_000,
    });

    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const parsed = parseQuery(searchQuerySchema, request.nextUrl.searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const term = parsed.data.q.trim();
    const products = await fetchProductsBySearch(term);

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de busca:", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }

    console.error("Error na API de busca:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
