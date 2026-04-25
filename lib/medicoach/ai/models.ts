import { anthropic } from "@ai-sdk/anthropic";
import type { EmbeddingModel, LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiGatewayEnabled } from "./env";

/** Modelo de chat: string `proveedor/modelo` usa AI Gateway (recomendado en Vercel / hackathon). */
export function resolveChatModel(): LanguageModel {
  if (aiGatewayEnabled()) {
    const id =
      process.env.AI_GATEWAY_CHAT_MODEL?.trim() ||
      "anthropic/claude-sonnet-4-20250514";
    return id as LanguageModel;
  }
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    const id =
      process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
    return anthropic(id);
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    const id =
      process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";
    return openai(id);
  }
  throw new Error(
    "Sin modelo de chat: Gateway, ANTHROPIC_API_KEY u OPENAI_API_KEY.",
  );
}

/** Embeddings: mismo criterio Gateway vs proveedor directo. */
export function resolveEmbeddingModel(): EmbeddingModel {
  if (aiGatewayEnabled()) {
    return "openai/text-embedding-3-small";
  }
  return openai.embedding("text-embedding-3-small");
}
