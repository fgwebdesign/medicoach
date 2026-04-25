/**
 * Carga fragmentos en `medical_knowledge` con embeddings (OpenAI o AI Gateway).
 *
 * Fuentes (en orden):
 *   1. `data/knowledge/mvp-curated.json` — contenido educativo MVP (siempre).
 *   2. `data/knowledge/openfda-chunks.json` — si existe (generar con
 *      `npx tsx scripts/fetch-openfda-knowledge.ts`).
 *
 * Requiere `.env.local`: SUPABASE_SERVICE_ROLE_KEY + OPENAI_API_KEY o Gateway.
 *
 * Uso:
 *   npx tsx scripts/ingest-knowledge.ts
 *   npx tsx scripts/ingest-knowledge.ts --clear   # borra filas source mvp/openfda antes
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createAdminClient } from "../lib/integrations/supabase/admin";
import { embedQuery } from "../lib/medicoach/rag/embed";

type Row = {
  source: string;
  category?: string;
  content: string;
  metadata?: Record<string, unknown>;
};

function loadJson(file: string): Row[] {
  const p = path.join(process.cwd(), file);
  try {
    const raw = readFileSync(p, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as Row[];
  } catch {
    return [];
  }
}

async function main() {
  const clear = process.argv.includes("--clear");
  const supabase = createAdminClient();

  const curated = loadJson("data/knowledge/mvp-curated.json");
  const openfda = loadJson("data/knowledge/openfda-chunks.json");
  const rows = [...curated, ...openfda];

  if (rows.length === 0) {
    console.error("No hay filas en data/knowledge/*.json");
    process.exit(1);
  }

  if (clear) {
    const { error } = await supabase
      .from("medical_knowledge")
      .delete()
      .in("source", ["mvp-curated", "openfda"]);
    if (error) {
      console.error("delete:", error);
      process.exit(1);
    }
    console.log("Filas previas (mvp-curated / openfda) eliminadas.");
  }

  for (const row of rows) {
    if (!row.content?.trim()) continue;
    const embedding = await embedQuery(row.content);
    const vectorLiteral = `[${embedding.join(",")}]`;
    const { error } = await supabase.from("medical_knowledge").insert({
      source: row.source,
      category: row.category ?? null,
      content: row.content,
      embedding: vectorLiteral,
      metadata: row.metadata ?? {},
    });
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log("OK insert", row.source, row.category ?? "");
  }
  console.log("Listo.", rows.length, "fragmentos.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
