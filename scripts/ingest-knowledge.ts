/**
 * Carga un subconjunto fijo en `medical_knowledge` con embeddings OpenAI.
 * Uso: `npx tsx scripts/ingest-knowledge.ts` (requiere .env.local con OPENAI_* y SUPABASE_SERVICE_ROLE_KEY).
 */
import { createAdminClient } from "../lib/integrations/supabase/admin";
import { embedQuery } from "../lib/medicoach/rag/embed";

const SEED = [
  {
    source: "seed",
    category: "diabetes",
    content:
      "Pregunta: ¿Cuáles son síntomas frecuentes de la diabetes tipo 2?\n" +
      "Respuesta: Sede, orinar con frecuencia, fatiga, visión borrosa y hambre intensa. Siempre consultá con tu equipo de salud.",
    metadata: { locale: "es" },
  },
  {
    source: "seed",
    category: "hipertension",
    content:
      "Pregunta: ¿Qué es la presión arterial alta?\n" +
      "Respuesta: Es cuando la fuerza de la sangre contra las paredes de las arterias es demasiado alta de forma sostenida. El seguimiento médico es esencial.",
    metadata: { locale: "es" },
  },
  {
    source: "seed",
    category: "adherencia",
    content:
      "Pregunta: ¿Por qué importa tomar la medicación a la misma hora?\n" +
      "Respuesta: Ayuda a mantener niveles estables del fármaco en sangre y mejora la adherencia al tratamiento.",
    metadata: { locale: "es" },
  },
] as const;

async function main() {
  const supabase = createAdminClient();
  for (const row of SEED) {
    const embedding = await embedQuery(row.content);
    const vectorLiteral = `[${embedding.join(",")}]`;
    const { error } = await supabase.from("medical_knowledge").insert({
      source: row.source,
      category: row.category,
      content: row.content,
      embedding: vectorLiteral,
      metadata: row.metadata,
    });
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log("OK insert", row.category);
  }
  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
