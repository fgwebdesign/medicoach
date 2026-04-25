/**
 * Descarga extractos estructurados de openFDA (JSON oficial, sin scraping HTML).
 * Genera `data/knowledge/openfda-chunks.json` para combinar con la ingesta.
 *
 * Uso: `npx tsx scripts/fetch-openfda-knowledge.ts`
 * Opcional: `OPENFDA_API_KEY` en .env.local si superás cuota anónima.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

type Chunk = {
  source: string;
  category: string;
  content: string;
  metadata: Record<string, unknown>;
};

const OUT = path.join(process.cwd(), "data/knowledge/openfda-chunks.json");

const QUERIES: { search: string; category: string; label: string }[] = [
  {
    search: "openfda.generic_name:METFORMIN+AND+product_type:HUMAN+PRESCRIPTION+DRUG",
    category: "fda_metformina",
    label: "Metformina (etiqueta FDA, extracto)",
  },
  {
    search: "openfda.generic_name:LISINOPRIL+AND+product_type:HUMAN+PRESCRIPTION+DRUG",
    category: "fda_lisinopril",
    label: "Lisinopril (etiqueta FDA, extracto)",
  },
  {
    search: "openfda.generic_name:ATORVASTATIN+AND+product_type:HUMAN+PRESCRIPTION+DRUG",
    category: "fda_atorvastatina",
    label: "Atorvastatina (etiqueta FDA, extracto)",
  },
];

function firstText(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === "string" ? v : ""))
      .join("\n")
      .trim();
  }
  return "";
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

async function fetchLabel(search: string): Promise<Record<string, unknown> | null> {
  const key = process.env.OPENFDA_API_KEY?.trim();
  const u = new URL("https://api.fda.gov/drug/label.json");
  u.searchParams.set("search", search);
  u.searchParams.set("limit", "1");
  if (key) u.searchParams.set("api_key", key);
  const res = await fetch(u.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.warn("openFDA HTTP", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = (await res.json()) as { results?: Record<string, unknown>[] };
  return json.results?.[0] ?? null;
}

async function main() {
  const chunks: Chunk[] = [];
  for (const q of QUERIES) {
    const row = await fetchLabel(q.search);
    if (!row) {
      console.warn("Sin resultado para", q.label);
      continue;
    }
    const parts = [
      firstText(row.indications_and_usage),
      firstText(row.purpose),
      firstText(row.warnings),
    ].filter(Boolean);
    const body = clip(parts.join("\n\n"), 2200);
    if (!body) {
      console.warn("Sin texto útil para", q.label);
      continue;
    }
    chunks.push({
      source: "openfda",
      category: q.category,
      content:
        `${q.label}. Texto derivado de la base openFDA (EE.UU.); no reemplaza prospecto local ni indicación médica.\n\n` +
        body,
      metadata: {
        locale: "es-context",
        openfda: true,
        disclaimer: "US_label_excerpt",
      },
    });
    console.log("OK", q.label);
  }
  writeFileSync(OUT, JSON.stringify(chunks, null, 2), "utf-8");
  console.log("Escrito", OUT, `(${chunks.length} fragmentos)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
