import {
  fetchReviewsByProduct,
  createReview,
} from "../../../../lib/data-layer";
import {
  reviewsQuerySchema,
  reviewBodySchema,
  parseQuery,
} from "../../../../lib/validation";
import {
  isConnectionError,
  DB_CONNECTION_ERROR_MESSAGE,
} from "../../../../lib/errors";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const parsed = parseQuery(reviewsQuerySchema, request.nextUrl.searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetro productId inválido" },
        { status: 400 }
      );
    }

    const reviews = await fetchReviewsByProduct(parsed.data.productId);

    return NextResponse.json(reviews, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de reviews (GET):", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }
    console.error("Erro na API de reviews (GET):", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = reviewBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const review = await createReview(parsed.data);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de reviews (POST):", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }
    console.error("Erro na API de reviews (POST):", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
