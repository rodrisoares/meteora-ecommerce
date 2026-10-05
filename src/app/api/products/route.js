import { fetchProducts } from "../../../../lib/data-layer";
import { productsQuerySchema, parseQuery } from "../../../../lib/validation";
import {
  isConnectionError,
  DB_CONNECTION_ERROR_MESSAGE,
} from "../../../../lib/errors";
import { NextResponse } from "next/server";

// Força a execução dinamica (sem cache do Next)
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const parsed = parseQuery(productsQuerySchema, request.nextUrl.searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { limit, featured } = parsed.data;
    const products = await fetchProducts({ limit, featuredOnly: featured });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store", // didatico, apenas para lembrar browser/CDN
      },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de produtos:", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }

    console.error("Erro na API de produtos:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
