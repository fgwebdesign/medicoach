import { tool } from "ai";
import { z } from "zod";
import { createAdminClient } from "@/lib/integrations/supabase/admin";
import {
  fetchDrugInteractions,
  fetchDrugLabel,
} from "@/lib/medicoach/fda/client";
import { mentionsDrug } from "@/lib/medicoach/fda/interactions";
import { searchMedicalKnowledge } from "@/lib/medicoach/knowledge-search";
import type { Locale } from "@/lib/i18n/types";

interface ToolContext {
  patientId?: string;
  /** Idioma de la conversación (afecta descripciones de tools y textos de respuesta). */
  locale?: Locale;
}

export function createMediCoachTools(ctx: ToolContext = {}) {
  const locale = ctx.locale ?? "es";
  const en = locale === "en";

  return {
    consultar_medicamento: tool({
      description: en
        ? "Look up official U.S. medication information from openFDA (adverse effects, warnings, dosing on label). Use whenever a drug name is mentioned or clearly implied."
        : "Busca información oficial de un medicamento en openFDA: efectos adversos, contraindicaciones, dosis. Usá esto SIEMPRE que el paciente mencione un medicamento.",
      inputSchema: z.object({
        nombre: z
          .string()
          .describe(
            en
              ? "Drug name (e.g. metformin, lisinopril). English or INN is fine."
              : "Nombre del medicamento (ej: metformin, enalapril)",
          ),
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
      description: en
        ? "Search the curated MediCoach knowledge base on common diabetes and blood pressure medications. Entries are mostly in Spanish; the search maps common English terms. Use for general education when openFDA is not needed."
        : "Busca en la base de conocimiento curada sobre medicamentos comunes para diabetes e hipertensión. Acepta consulta en español; en inglés también convierte términos frecuentes.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            en
              ? 'Question or keywords, English or Spanish, e.g. "dizziness after metformin", "mareos metformina"'
              : 'Consulta, ej: "mareos por metformina" o en inglés "dizziness metformin"',
          ),
      }),
      execute: async ({ query }) => {
        const results = searchMedicalKnowledge(query, locale, 4);
        return {
          results,
          fuente: en
            ? "MediCoach curated knowledge base"
            : "MediCoach Knowledge Base (curado)",
        };
      },
    }),

    registrar_sintoma: tool({
      description: en
        ? "Log a symptom the user reports into their chart. Use when they describe how they feel (optionally with severity and context)."
        : "Registra un síntoma reportado por el paciente en su historial clínico. Usalo cuando el paciente describa cómo se siente.",
      inputSchema: z.object({
        sintoma: z
          .string()
          .describe(
            en
              ? 'Normalized symptom name, e.g. "dizziness", "headache", "nausea"'
              : 'Nombre del síntoma normalizado, ej: "mareos", "cefalea", "náuseas"',
          ),
        severidad: z.number().min(1).max(10).describe("Severity 1-10"),
        contexto: z
          .string()
          .optional()
          .describe(
            en
              ? 'Optional context, e.g. "after taking metformin"'
              : 'Contexto: ej "después de tomar metformina"',
          ),
      }),
      execute: async ({ sintoma, severidad, contexto }) => {
        if (!ctx.patientId) {
          return { error: en ? "Not signed in" : "Usuario no autenticado" };
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
          mensaje: en
            ? `Logged “${sintoma}” with severity ${severidad}/10`
            : `Registré "${sintoma}" con severidad ${severidad}/10`,
        };
      },
    }),

    obtener_historial: tool({
      description: en
        ? "Get symptoms logged in the last N days and the patient’s current active medication list (from their account)."
        : "Obtiene los síntomas y medicación activa del paciente en los últimos N días.",
      inputSchema: z.object({
        dias: z.number().min(1).max(30).default(7),
      }),
      execute: async ({ dias }) => {
        if (!ctx.patientId) {
          return { error: en ? "Not signed in" : "Usuario no autenticado" };
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
      description: en
        ? "Starts the in-app PDF report flow (progress panel + download). Use when they ask for a summary, a PDF, or something to show their clinician. The app opens the same UI as the “Reporte PDF” button in chat."
        : "Inicia el flujo de reporte en la app: panel con pasos y descarga de PDF. Usalo si piden resumen, PDF, informe, o qué llevar al médico. Se abre el mismo asistente que el botón «Reporte PDF» en el chat.",
      inputSchema: z.object({}),
      execute: async () => {
        return {
          url: "/report",
          abrirAsistenteDescarga: true,
          mensaje: en
            ? "I’m opening the on-screen report assistant. You’ll see the steps and the PDF will download when ready. You can also use the “Reporte PDF” (Report PDF) button in the chat bar."
            : "Abrí el asistente de reporte: vas a ver el progreso y se baja el PDF. Si no se abre el panel, tocá el botón «Reporte PDF» en la barra arriba del chat.",
        };
      },
    }),
  };
}
