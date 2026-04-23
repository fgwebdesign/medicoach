import { NextResponse } from "next/server";

/**
 * Placeholder: reemplazá por stream del grafo LangGraph + Vercel AI SDK.
 * @see MediCoach_Tech_Guide.pdf — /api/chat
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Agente no cableado aún. Implementá el grafo en lib/agent/ y streameá la respuesta aquí.",
    },
    { status: 501 },
  );
}
