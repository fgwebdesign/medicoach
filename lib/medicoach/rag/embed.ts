import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

/** Embeddings 1536 dim alineados a `medical_knowledge.embedding vector(1536)`. */
export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
    providerOptions: {
      openai: {
        dimensions: 1536,
      },
    },
  });
  if (embedding.length !== 1536) {
    throw new Error(
      `Embedding dim ${embedding.length} distinto de 1536; revisá el modelo.`,
    );
  }
  return embedding;
}
