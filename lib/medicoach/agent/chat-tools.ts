import { tool } from "ai";
import { z } from "zod";
import { createAdminClient } from "@/lib/integrations/supabase/admin";
import {
  fetchDrugInteractions,
  fetchDrugLabel,
} from "@/lib/medicoach/fda/client";
import { mentionsDrug } from "@/lib/medicoach/fda/interactions";
import medicalKnowledge from "@/data/medical-knowledge.json";

interface ToolContext {
  patientId?: string;
}

interface MedicalKnowledgeEntry {
  id: string;
  drug: string;
  topic: string;
  content: string;
  source: string;
}

export function createMediCoachTools(ctx: ToolContext = {}) {
  return {
    consultar_medicamento: tool({
      description:
        "Busca información oficial de un medicamento en openFDA: efectos adversos, contraindicaciones, dosis. Usá esto SIEMPRE que el paciente mencione un medicamento.",
      inputSchema: z.object({
        nombre: z
          .string()
          .describe("Nombre del medicamento (ej: metformin, enalapril)"),
      }),
      execute: async ({ nombre }) => {
        try {
          const label = await fetchDrugLabel(nombre);
          return label;
        } catch (e) {
          return { error: String(e), nombre };
        }
      },
    }),

    detectar_interacciones: tool({
      description:
        "Verifica si dos medicamentos tienen interacciones conocidas consultando openFDA (sección drug_interactions).",
      inputSchema: z.object({
        medicamento1: z.string(),
        medicamento2: z.string(),
      }),
      execute: async ({ medicamento1, medicamento2 }) => {
        const [label1, label2] = await Promise.all([
          fetchDrugInteractions(medicamento1),
          fetchDrugInteractions(medicamento2),
        ]);

        const warnings1 =
          "error" in label1 ? "" : (label1.drug_interactions ?? "");
        const warnings2 =
          "error" in label2 ? "" : (label2.drug_interactions ?? "");

        const interaccion =
          mentionsDrug(warnings1, medicamento2) ||
          mentionsDrug(warnings2, medicamento1);

        const detailFrom = (label: typeof label1, warnings: string) => {
          if ("error" in label) return `Error openFDA: ${label.error}`.slice(0, 400);
          return warnings.slice(0, 400) || "Sin datos de interacciones en FDA";
        };

        return {
          medicamento1,
          medicamento2,
          interaccion_detectada: interaccion,
          detalle1: detailFrom(label1, warnings1),
          detalle2: detailFrom(label2, warnings2),
          fuente: "openFDA Drug Label",
        };
      },
    }),

    buscar_conocimiento: tool({
      description:
        "Busca en la base de conocimiento curada en español sobre medicamentos comunes para diabetes e hipertensión.",
      inputSchema: z.object({
        query: z
          .string()
          .describe('Consulta en español, ej: "mareos por metformina"'),
      }),
      execute: async ({ query }) => {
        const q = query.toLowerCase();
        const knowledge = medicalKnowledge as MedicalKnowledgeEntry[];
        const results = knowledge
          .filter(
            (item) =>
              item.content.toLowerCase().includes(q) ||
              item.drug.toLowerCase().includes(q) ||
              item.topic.toLowerCase().includes(q),
          )
          .slice(0, 4);
        return { results, fuente: "MediCoach Knowledge Base (curado)" };
      },
    }),

    registrar_sintoma: tool({
      description:
        "Registra un síntoma reportado por el paciente en su historial clínico. Usalo cuando el paciente describa cómo se siente.",
      inputSchema: z.object({
        sintoma: z
          .string()
          .describe(
            'Nombre del síntoma normalizado, ej: "mareos", "cefalea", "náuseas"',
          ),
        severidad: z.number().min(1).max(10).describe("Severidad 1-10"),
        contexto: z
          .string()
          .optional()
          .describe('Contexto: ej "después de tomar metformina"'),
      }),
      execute: async ({ sintoma, severidad, contexto }) => {
        if (!ctx.patientId) {
          return { error: "Usuario no autenticado" };
        }
        const admin = createAdminClient();
        const { data, error } = await admin
          .from("symptoms")
          .insert({
            patient_id: ctx.patientId,
            symptom: sintoma.toLowerCase().trim(),
            severity: severidad,
            note: contexto ?? null,
            recorded_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) {
          console.error("[registrar_sintoma] Error:", error);
          return { error: error.message };
        }
        return {
          ok: true,
          id: data.id,
          mensaje: `Registré "${sintoma}" con severidad ${severidad}/10`,
        };
      },
    }),

    obtener_historial: tool({
      description:
        "Obtiene los síntomas y medicación tomados por el paciente en los últimos N días.",
      inputSchema: z.object({
        dias: z.number().min(1).max(30).default(7),
      }),
      execute: async ({ dias }) => {
        if (!ctx.patientId) {
          return { error: "Usuario no autenticado" };
        }
        const admin = createAdminClient();
        const desde = new Date(
          Date.now() - dias * 24 * 60 * 60 * 1000,
        ).toISOString();
        const [symptoms, medications] = await Promise.all([
          admin
            .from("symptoms")
            .select("*")
            .eq("patient_id", ctx.patientId)
            .gte("recorded_at", desde)
            .order("recorded_at", { ascending: false }),
          admin
            .from("medications")
            .select("*")
            .eq("patient_id", ctx.patientId)
            .eq("active", true),
        ]);
        return {
          sintomas: symptoms.data ?? [],
          medicaciones: medications.data ?? [],
          dias,
        };
      },
    }),

    generar_url_reporte: tool({
      description:
        "Genera el link al reporte PDF que el paciente puede descargar para llevar a su médico. Usalo cuando el paciente pida un resumen o reporte.",
      inputSchema: z.object({}),
      execute: async () => {
        return {
          url: "/report",
          mensaje:
            "Reporte listo para descargar en /report — podés compartirlo con tu médico",
        };
      },
    }),
  };
}
