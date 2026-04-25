import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/integrations/supabase/admin";

export interface PatternAlert {
  sintoma: string;
  count: number;
  severidadPromedio: number;
  primeraOcurrencia: string;
}

type SymptomRow = {
  symptom: string;
  severity: number;
  recorded_at: string;
};

function aggregateSymptomPatterns(
  data: SymptomRow[],
  minCount: number,
): PatternAlert[] {
  const groups = new Map<
    string,
    { count: number; severitySum: number; first: string }
  >();

  for (const row of data) {
    const key = row.symptom.toLowerCase().trim();
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.severitySum += row.severity;
      if (row.recorded_at < existing.first) {
        existing.first = row.recorded_at;
      }
    } else {
      groups.set(key, {
        count: 1,
        severitySum: row.severity,
        first: row.recorded_at,
      });
    }
  }

  const alerts: PatternAlert[] = [];
  for (const [sintoma, g] of groups.entries()) {
    if (g.count >= minCount) {
      alerts.push({
        sintoma,
        count: g.count,
        severidadPromedio: g.severitySum / g.count,
        primeraOcurrencia: g.first,
      });
    }
  }
  alerts.sort((a, b) => b.count - a.count);
  return alerts;
}

/**
 * Misma lógica que detectPatterns pero usando un cliente Supabase (p. ej. sesión + RLS).
 */
export async function detectPatternsWithClient(
  supabase: SupabaseClient,
  patientId: string,
  dias = 5,
  minCount = 3,
): Promise<PatternAlert[]> {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("symptoms")
    .select("symptom, severity, recorded_at")
    .eq("patient_id", patientId)
    .gte("recorded_at", desde)
    .order("recorded_at", { ascending: false });

  if (error || !data) {
    console.error("[detectPatternsWithClient]", error);
    return [];
  }

  return aggregateSymptomPatterns(data as SymptomRow[], minCount);
}

/**
 * Detección de patrones con service role (API / jobs).
 */
export async function detectPatterns(
  patientId: string,
  dias = 5,
  minCount = 3,
): Promise<PatternAlert[]> {
  const admin = createAdminClient();
  return detectPatternsWithClient(admin, patientId, dias, minCount);
}
