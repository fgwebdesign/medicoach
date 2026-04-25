import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { aiGatewayEnabled } from "@/lib/medicoach/ai/env";
import { resolveChatModel } from "@/lib/medicoach/ai/models";
import { createMediCoachTools } from "@/lib/medicoach/agent/chat-tools";
import { runIntentGraph } from "@/lib/medicoach/agent/graph";
import { MEDICOACH_SYSTEM_PROMPT } from "@/lib/medicoach/agent/prompts";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  persistChatTurn,
  type ChatMessageSnapshot,
} from "@/lib/medicoach/persistence/chat-session";
import { chatRequestSchema } from "@/lib/validation/chat-request";

export const maxDuration = 60;

function lastUserTextFromUi(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role !== "user" || !m.parts?.length) continue;
    const text = m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text.trim()) return text;
  }
  return "";
}

function uiMessagesToSnapshot(messages: UIMessage[]): ChatMessageSnapshot[] {
  return messages.map((m) => {
    const text =
      m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n") ?? "";
    return { role: m.role, content: text };
  });
}

export async function POST(req: Request) {
  const gateway = aiGatewayEnabled();
  const openaiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const anthropicKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

  const canChat = gateway || anthropicKey || openaiKey;
  const canEmbed = gateway || openaiKey;

  if (!canChat) {
    return Response.json(
      {
        error:
          "Configurá Vercel AI Gateway, ANTHROPIC_API_KEY o OPENAI_API_KEY para el modelo de chat.",
      },
      { status: 503 },
    );
  }
  if (!canEmbed) {
    return Response.json(
      {
        error:
          "Hace falta OPENAI_API_KEY para embeddings (o activá AI Gateway, que incluye embeddings).",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Body inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { messages: rawMessages, sessionId } = parsed.data;
  const messages = rawMessages as UIMessage[];

  let modelMessages;
  const tools = createMediCoachTools();
  try {
    modelMessages = await convertToModelMessages(messages, { tools });
  } catch (e) {
    return Response.json(
      { error: "No se pudo convertir el historial de mensajes", detail: String(e) },
      { status: 400 },
    );
  }

  const lastUserText = lastUserTextFromUi(messages);
  const { intent } = await runIntentGraph(lastUserText || "hola");

  const systemAugmented = `${MEDICOACH_SYSTEM_PROMPT}

Contexto (EE.UU. / FDA): las fuentes de medicamentos pueden ser etiquetas FDA; no sustituyen al médico ni al prospecto local.
Intención detectada (heurística): "${intent}".`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = streamText({
    model: resolveChatModel(),
    system: systemAugmented,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(8),
    onFinish: async ({ text }) => {
      if (!user?.id) return;
      try {
        const snap = uiMessagesToSnapshot(messages);
        snap.push({ role: "assistant", content: text });
        await persistChatTurn({
          patientId: user.id,
          sessionId,
          messages: snap,
        });
      } catch (err) {
        console.error("[chat] persistChatTurn", err);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
