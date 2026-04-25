import { buildReportPdfBuffer, messagesJsonToExcerpt } from "@/lib/medicoach/report/build-report-pdf";
import { createClient } from "@/lib/integrations/supabase/server";

export const maxDuration = 30;

/**
 * Genera un PDF con perfil, medicación, síntomas e extracto de la última charla
 * (desde `chat_sessions`). Requiere sesión Supabase.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json(
        { error: "Iniciá sesión para descargar el reporte." },
        { status: 401 },
      );
    }

    const emailHint = user.email ?? user.id.slice(0, 8);
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [profileRes, medRes, symRes, chatRes] = await Promise.all([
      supabase
        .from("patient_profiles")
        .select("display_name, conditions")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("medications")
        .select("name, dose, frequency")
        .eq("patient_id", user.id)
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("symptoms")
        .select("symptom, severity, note, recorded_at")
        .eq("patient_id", user.id)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: false })
        .limit(40),
      supabase
        .from("chat_sessions")
        .select("updated_at, messages")
        .eq("patient_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const row = chatRes.data;
    const sessionUpdated = row?.updated_at
      ? new Date(row.updated_at).toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";
    const chat = row
      ? messagesJsonToExcerpt(row.messages, sessionUpdated)
      : null;

    const generatedAt = new Date().toLocaleString("es-AR", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const pdf = await buildReportPdfBuffer({
      generatedAt,
      emailHint,
      profile: profileRes.data
        ? {
            display_name: profileRes.data.display_name,
            conditions: profileRes.data.conditions,
          }
        : null,
      medications: (medRes.data ?? []).map((m) => ({
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
      })),
      symptoms: (symRes.data ?? []).map((s) => ({
        symptom: s.symptom,
        severity: s.severity,
        note: s.note,
        recorded_at: s.recorded_at,
      })),
      chat,
      disclaimer:
        "Aviso: MediCoach no sustituye la consulta con un profesional de la salud. " +
        "Esta hoja es un apoyo informativo generado a partir de lo que registraste en la app. " +
        "No constituye diagnóstico ni prescripción. En caso de emergencia, buscá atención inmediata.",
    });

    const day = new Date().toISOString().slice(0, 10);
    const filename = `MediCoach-reporte-${day}.pdf`;

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, private",
      },
    });
  } catch (e) {
    console.error("[api/report]", e);
    const isDev = process.env.NODE_ENV === "development";
    return Response.json(
      {
        error: "No se pudo generar el reporte. Probá otra vez en unos minutos.",
        details: isDev && e instanceof Error ? e.message : undefined,
      },
      { status: 500 },
    );
  }
}
