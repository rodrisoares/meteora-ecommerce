import { createOrder, fetchOrdersByEmail } from "../../../../lib/data-layer";
import {
  ordersQuerySchema,
  orderBodySchema,
  parseQuery,
} from "../../../../lib/validation";
import {
  isConnectionError,
  DB_CONNECTION_ERROR_MESSAGE,
} from "../../../../lib/errors";
import { logger } from "../../../../lib/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const parsed = parseQuery(ordersQuerySchema, request.nextUrl.searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetro email inválido" },
        { status: 400 }
      );
    }

    const orders = await fetchOrdersByEmail(parsed.data.email);

    return NextResponse.json(orders, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de orders (GET):", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }
    console.error("Erro na API de orders (GET):", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = orderBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await createOrder(parsed.data);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (isConnectionError(error)) {
      logger.error("api:orders:POST", "Banco indisponível", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }

    // Itens fora de estoque/inativos: recusa o pedido com mensagem clara
    if (error?.code === "ITEMS_UNAVAILABLE") {
      logger.warn("api:orders:POST", "Pedido com itens indisponíveis");
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logger.error("api:orders:POST", "Falha ao criar pedido", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
