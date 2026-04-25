import { generateText } from "ai";
import medicalKnowledge from "@/data/medical-knowledge.json";
import { aiGatewayEnabled } from "@/lib/medicoach/ai/env";
import { resolveChatModel } from "@/lib/medicoach/ai/models";
import { createClient } from "@/lib/integrations/supabase/server";

export const maxDuration = 60;

/** Escenario tipo demo María: diabetes T2 + mareos post-metformina (sin tools; solo modelo). */
const PROMPT_DEFAULT = `Actuá como MediCoach: paciente con diabetes tipo 2, hace 3 días con mareos leves después de tomar metformina en el desayuno.
Respondé en español rioplatense, 4 oraciones máximo. No des diagnóstico ni cambies dosis; sugerí consultar al médico si empeora o hay síntomas de alarma.`;

type KnowledgeEntry = {
  id: string;
  drug: string;
  topic: string;
  content: string;
  source: string;
};

function sampleCurado() {
  const rows = medicalKnowledge as KnowledgeEntry[];
  const metforminaMareos = rows.find((r) => r.id === "metformina-mareos");
  const diabetesGeneral = rows.find((r) => r.id === "diabetes-control-glucemia");
  return { metforminaMareos, diabetesGeneral };
}

/**
 * Demo para Bruno / curl: encadena AI Gateway + escenario clínico suave.
 *
 * POST JSON opcional: `{ "mensaje": "tu propio escenario..." }`
 * Si omitís el body, usa el escenario default (metformina + mareos).
 */
export async function POST(req: Request) {
  const hasGateway = aiGatewayEnabled();
  const hasDirect =
    Boolean(process.env.ANTHROPIC_API_KEY?.trim()) ||
    Boolean(process.env.OPENAI_API_KEY?.trim());

  if (!hasGateway && !hasDirect) {
    return Response.json(
      {
        error:
          "Configurá AI_GATEWAY_API_KEY (u OIDC) o ANTHROPIC_API_KEY / OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: "Iniciá sesión para usar este endpoint de prueba." },
      { status: 401 },
    );
  }

  let prompt = PROMPT_DEFAULT;
  try {
    const body = (await req.json()) as { mensaje?: string };
    if (typeof body?.mensaje === "string" && body.mensaje.trim()) {
      prompt = body.mensaje.trim();
    }
  } catch {
    /* body vacío → default */
  }

  const curado = sampleCurado();

  try {
    const result = await generateText({
      model: resolveChatModel(),
      prompt,
      maxOutputTokens: 400,
    });

    return Response.json({
      ok: true,
      modelo:
        process.env.AI_GATEWAY_CHAT_MODEL?.trim() ||
        "(default interno / resolveChatModel)",
      gateway: hasGateway,
      conocimiento_curado_muestra: curado,
      respuesta_llm: result.text,
      usage: result.usage,
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        conocimiento_curado_muestra: curado,
      },
      { status: 500 },
    );
  }
}

/**
 * Sin gastar tokens: confirmá que el endpoint existe y qué datos curados tenemos.
 */
export async function GET() {
  return Response.json({
    nombre: "Demo diabetes / metformina",
    post:
      "POST /api/demo/diabetes — body opcional { \"mensaje\": \"...\" }; si no, escenario default (mareos + metformina).",
    bruno: {
      method: "POST",
      url: "http://localhost:3000/api/demo/diabetes",
      headers: { "Content-Type": "application/json" },
      body: {
        mensaje:
          "Paciente con diabetes tipo 2: mareos tras metformina. Qué comentarle en forma general sin dar diagnóstico.",
      },
    },
    datos_curados_en_repo: sampleCurado(),
  });
}
