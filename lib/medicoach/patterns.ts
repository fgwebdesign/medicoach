import { createAdminClient } from "@/lib/integrations/supabase/admin";

export interface PatternAlert {
  sintoma: string;
  count: number;
  severidadPromedio: number;
  primeraOcurrencia: string;
}

/**
 * Detecta patrones de síntomas repetidos en los últimos N días.
 * Se considera patrón cuando un síntoma aparece >= minCount veces.
 *
 * @param patientId UUID del paciente
 * @param dias Ventana de tiempo (default: 5 días)
 * @param minCount Mínimo de ocurrencias para considerar patrón (default: 3)
 * @returns Array de alertas detectadas
 */
export async function detectPatterns(
  patientId: string,
  dias = 5,
  minCount = 3,
): Promise<PatternAlert[]> {
  const admin = createAdminClient();
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("symptoms")
    .select("symptom, severity, recorded_at")
    .eq("patient_id", patientId)
    .gte("recorded_at", desde)
    .order("recorded_at", { ascending: false });

  if (error || !data) {
    console.error("[detectPatterns] Error fetching symptoms:", error);
    return [];
  }

  // Agrupar por síntoma (normalizado a minúsculas)
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
      // Guardar la primera ocurrencia (más antigua)
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

  // Filtrar solo los que cumplen el umbral mínimo
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

  // Ordenar por count descendente (más frecuentes primero)
  alerts.sort((a, b) => b.count - a.count);

  return alerts;
}
