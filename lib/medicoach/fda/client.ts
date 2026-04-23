const FDA_BASE = "https://api.fda.gov/drug/label.json";

export type DrugLabelSummary = {
  ok: boolean;
  genericName: string;
  summary: string;
  rawCount?: number;
};

/**
 * Resumen corto desde openFDA (etiquetas US). Opcional `OPENFDA_API_KEY` para cuota.
 */
export async function fetchDrugLabelSummary(
  genericName: string,
): Promise<DrugLabelSummary> {
  const term = genericName.trim();
  if (!term) {
    return { ok: false, genericName: term, summary: "Nombre vacío." };
  }

  const search = `openfda.generic_name:${term}`;
  const params = new URLSearchParams({
    search,
    limit: "1",
  });
  const key = process.env.OPENFDA_API_KEY;
  if (key) params.set("api_key", key);

  const url = `${FDA_BASE}?${params.toString()}`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12_000);
  let res: Response;
  try {
    res = await fetch(url, { signal: ac.signal, next: { revalidate: 3600 } });
  } finally {
    clearTimeout(t);
  }

  if (res.status === 429) {
    return {
      ok: false,
      genericName: term,
      summary: "openFDA rate limit (429). Probá más tarde o usá OPENFDA_API_KEY.",
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      genericName: term,
      summary: `openFDA HTTP ${res.status}`,
    };
  }

  const json = (await res.json()) as {
    results?: Array<{
      indications_and_usage?: string[];
      contraindications?: string[];
      adverse_reactions?: string[];
      openfda?: { generic_name?: string[] };
    }>;
  };
  const label = json.results?.[0];
  if (!label) {
    return {
      ok: false,
      genericName: term,
      summary: "Sin etiqueta FDA para ese término.",
      rawCount: 0,
    };
  }

  const clip = (s: string | undefined, n: number) =>
    (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

  const parts = [
    label.indications_and_usage?.[0] &&
      `Indicaciones: ${clip(label.indications_and_usage[0], 400)}`,
    label.contraindications?.[0] &&
      `Contraindicaciones: ${clip(label.contraindications[0], 300)}`,
    label.adverse_reactions?.[0] &&
      `Efectos adversos: ${clip(label.adverse_reactions[0], 400)}`,
  ].filter(Boolean);

  return {
    ok: true,
    genericName: term,
    summary: parts.join("\n\n") || "Etiqueta sin secciones parseables.",
    rawCount: json.results?.length,
  };
}
