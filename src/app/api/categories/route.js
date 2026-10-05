import { fetchCategories } from "../../../../lib/data-layer";
import {
  isConnectionError,
  DB_CONNECTION_ERROR_MESSAGE,
} from "../../../../lib/errors";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await fetchCategories();

    console.log("[Server] ---->>>>> API roda do lado do server");

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.error("Banco indisponível na API de categorias:", error);
      return NextResponse.json(
        { error: DB_CONNECTION_ERROR_MESSAGE },
        { status: 503 }
      );
    }

    console.error("Erro interno no Servidor:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      {
        status: 500,
      }
    );
  }
}
