import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { aiGatewayEnabled } from "@/lib/medicoach/ai/env";
import { resolveChatModel } from "@/lib/medicoach/ai/models";
import { createMediCoachTools } from "@/lib/medicoach/agent/chat-tools";
import { getMcpTimeoutMs, resolveMcpBaseUrl } from "@/lib/medicoach/mcp/config";
import {
  formatPatternContext,
  getMediCoachSystemPrompt,
} from "@/lib/medicoach/agent/prompts";
import { detectPatterns } from "@/lib/medicoach/patterns";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  persistChatTurn,
  type ChatMessageSnapshot,
} from "@/lib/medicoach/persistence/chat-session";
import { chatRequestSchema } from "@/lib/validation/chat-request";

export const maxDuration = 60;

/**
 * `useChat` manda UIMessage con `parts[]`. Bruno/Postman suelen mandar `content` (estilo OpenAI).
 */
function normalizeToUiMessages(raw: unknown[]): UIMessage[] {
  return raw.map((m, i) => {
    if (!m || typeof m !== "object") {
      return m as UIMessage;
    }
    const o = m as Record<string, unknown>;
    if (Array.isArray(o.parts)) {
      return {
        id: String(o.id ?? `msg-${i}`),
        role: o.role,
        parts: o.parts,
      } as UIMessage;
    }
    if (typeof o.content === "string") {
      return {
        id: String(o.id ?? `msg-${i}`),
        role: o.role as UIMessage["role"],
        parts: [{ type: "text" as const, text: o.content }],
      } as UIMessage;
    }
    return m as UIMessage;
  });
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

  if (!canChat) {
    return Response.json(
      {
        error:
          "Configurá Vercel AI Gateway, ANTHROPIC_API_KEY o OPENAI_API_KEY para el modelo de chat.",
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

  const { messages: rawMessages, sessionId, locale } = parsed.data;
  const messages = normalizeToUiMessages(rawMessages);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        error:
          "Necesitás iniciar sesión para usar el chat. Entrá a MediCoach, creá una cuenta o accedé con tu email.",
      },
      { status: 401 },
    );
  }

  // Detección de patrones inyectada al system prompt
  let patternContext = "";
  if (user.id) {
    try {
      const patterns = await detectPatterns(user.id);
      patternContext = formatPatternContext(patterns, locale);
    } catch (err) {
      console.error("[chat] detectPatterns error:", err);
    }
  }

  /**
   * Conecta el agente a un servidor MCP (por defecto el propio /api/mcp) para
   * consultar_medicamento / detectar_interacciones / buscar_conocimiento. Cumplimiento
   * explícito de Track 2: el chat consume MCP en runtime, no solo publica el endpoint.
   */
  const mcpBaseUrl = resolveMcpBaseUrl(req.url);
  const mcp = {
    mcpBaseUrl,
    timeoutMs: getMcpTimeoutMs(),
  };
  const tools = createMediCoachTools({ patientId: user.id, locale, mcp });
  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(messages, { tools });
  } catch (e) {
    return Response.json(
      {
        error: "No se pudo convertir el historial de mensajes",
        detail: String(e),
      },
      { status: 400 },
    );
  }

  const result = streamText({
    model: resolveChatModel(),
    system: getMediCoachSystemPrompt(locale) + patternContext,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(8),
    onFinish: async ({ text }) => {
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
