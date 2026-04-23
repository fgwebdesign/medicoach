import { tool } from "ai";
import { z } from "zod";
import { fetchDrugLabelSummary } from "@/lib/medicoach/fda/client";
import { embedQuery } from "@/lib/medicoach/rag/embed";
import { searchMedicalKnowledge } from "@/lib/medicoach/rag/search";

export function createMediCoachTools() {
  return {
    searchMedicalKnowledge: tool({
      description:
        "Busca fragmentos de conocimiento médico curado en la base interna (RAG). Usalo para síntomas o educación sobre crónicos antes de generalizar.",
      inputSchema: z.object({
        query: z.string().min(3).describe("Consulta en lenguaje natural"),
      }),
      execute: async ({ query }) => {
        const embedding = await embedQuery(query);
        return await searchMedicalKnowledge(embedding, {
          threshold: 0.72,
          count: 5,
        });
      },
    }),
    getDrugLabel: tool({
      description:
        "Obtiene un resumen de la etiqueta FDA (Estados Unidos) para un medicamento por nombre genérico (ej. metformin).",
      inputSchema: z.object({
        genericName: z
          .string()
          .min(2)
          .describe("Nombre genérico en inglés o español, ej. metformin"),
      }),
      execute: async ({ genericName }) => {
        return await fetchDrugLabelSummary(genericName);
      },
    }),
  };
}
