const FDA_BASE = "https://api.fda.gov/drug/label.json";

export type DrugLabelSummary = {
  ok: boolean;
  genericName: string;
  summary: string;
  rawCount?: number;
};

export type DrugLabelDetail = {
  nombre: string;
  efectos_adversos?: string;
  contraindicaciones?: string;
  dosis?: string;
  fuente: string;
} | { error: string; nombre: string };

export type DrugInteractionsDetail =
  | { nombre: string; drug_interactions?: string; fuente: string }
  | { error: string; nombre: string };

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

/**
 * Obtiene detalle estructurado de un medicamento desde openFDA para tools del agente.
 * Devuelve campos separados: efectos_adversos, contraindicaciones, dosis.
 */
export async function fetchDrugLabel(
  genericName: string,
): Promise<DrugLabelDetail> {
  const term = genericName.trim().toLowerCase();
  if (!term) {
    return { error: "Nombre vacío", nombre: term };
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
      error: "openFDA rate limit. Probá más tarde o configurá OPENFDA_API_KEY",
      nombre: term,
    };
  }
  if (!res.ok) {
    return {
      error: `Error HTTP ${res.status} de openFDA`,
      nombre: term,
    };
  }

  const json = (await res.json()) as {
    results?: Array<{
      adverse_reactions?: string[];
      contraindications?: string[];
      dosage_and_administration?: string[];
    }>;
  };

  const label = json.results?.[0];
  if (!label) {
    return {
      error: "No se encontró información oficial",
      nombre: term,
    };
  }

  const clip = (s: string | undefined, n: number) =>
    (s ?? "").replace(/\s+/g, " ").trim().slice(0, n) || "No disponible";

  return {
    nombre: term,
    efectos_adversos: clip(label.adverse_reactions?.[0], 600),
    contraindicaciones: clip(label.contraindications?.[0], 400),
    dosis: clip(label.dosage_and_administration?.[0], 400),
    fuente: "FDA Drug Label (openFDA)",
  };
}

/**
 * Obtiene la sección `drug_interactions` desde openFDA Drug Label.
 * Útil para detectar menciones cruzadas entre medicamentos.
 */
export async function fetchDrugInteractions(
  genericName: string,
): Promise<DrugInteractionsDetail> {
  const term = genericName.trim().toLowerCase();
  if (!term) {
    return { error: "Nombre vacío", nombre: term };
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
      error: "openFDA rate limit. Probá más tarde o configurá OPENFDA_API_KEY",
      nombre: term,
    };
  }
  if (!res.ok) {
    return {
      error: `Error HTTP ${res.status} de openFDA`,
      nombre: term,
    };
  }

  const json = (await res.json()) as {
    results?: Array<{
      drug_interactions?: string[];
    }>;
  };

  const label = json.results?.[0];
  if (!label) {
    return {
      error: "No se encontró información oficial",
      nombre: term,
    };
  }

  const text =
    (label.drug_interactions?.[0] ?? "").replace(/\s+/g, " ").trim() ||
    undefined;

  return {
    nombre: term,
    drug_interactions: text,
    fuente: "FDA Drug Label (openFDA)",
  };
}
