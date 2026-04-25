import medicalKnowledge from "@/data/medical-knowledge.json";
import type { Locale } from "@/lib/i18n/types";

type KnowledgeRow = {
  id: string;
  drug: string;
  topic: string;
  content: string;
  source: string;
};

/**
 * Términos frecuentes en inglés → equivalentes en español (la base curada está en ES).
 * Mejora el matcheo cuando el usuario escribe en EN.
 */
const EN_ALIASES: Record<string, string[]> = {
  dizziness: ["mareo", "mareos", "vértigo", "vertigo"],
  drowsy: ["somnolencia", "cansancio"],
  metformin: ["metformina"],
  lisinopril: ["enalapril", "losartan"],
  "blood pressure": ["presión", "hipertensión"],
  cough: ["tos"],
  headache: ["cefalea", "cabeza"],
  nausea: ["náusea", "nauseas"],
  fatigue: ["fatiga", "cansancio"],
  edema: ["edema", "hinchazón", "tobillos"],
  hypoglycemia: ["hipogluc", "bajada de azúcar"],
  insulin: ["insulina", "glargina"],
  semaglutide: ["semaglutida", "ozempic", "wegovy"],
  empagliflozin: ["empagliflozina", "jardiance"],
  dapagliflozin: ["dapagliflozina", "forxiga"],
  sglt2: ["empaglifloz", "dapaglifloz", "gliflozina"],
  glp: ["semaglut", "liraglut", "dulaglut"],
  "beta blocker": ["metoprolol", "atenolol", "betabloq"],
  metoprolol: ["metoprolol", "beta bloque"],
  dpp: ["sitaglipt", "saxaglipt", "linagliptin"],
  statin: ["atorvastat", "simvastat", "statinas"],
  grapefruit: ["pomelo", "toronja", "pomel"],
};

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-záéíóúñü0-9]+/g)
    .filter((t) => t.length > 1);
}

/**
 * Añade términos en español ligados a palabras en inglés detectadas en la query.
 */
function augmentQueryForLocale(query: string, locale: Locale): string {
  const q = query.trim().toLowerCase();
  if (locale === "es") return q;
  const extra: string[] = [];
  for (const [enKey, esTerms] of Object.entries(EN_ALIASES)) {
    if (q.includes(enKey) || (enKey.includes(" ") && q.includes(enKey))) {
      extra.push(...esTerms);
    } else {
      for (const w of enKey.split(/\s+/)) {
        if (w.length > 2 && new RegExp(`\\b${w}\\b`, "i").test(q)) {
          extra.push(...esTerms);
        }
      }
    }
  }
  return [q, ...new Set(extra)].join(" ");
}

/**
 * Búsqueda en la base curada: query original + términos cruzados (EN→ES) en modo en.
 */
export function searchMedicalKnowledge(
  query: string,
  locale: Locale,
  limit: number = 4,
): KnowledgeRow[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  const expanded = augmentQueryForLocale(q, locale);
  const terms = new Set(
    tokenize(expanded).filter((t) => t.length > 1),
  );
  if (locale === "en" && terms.size < 2) {
    for (const w of tokenize(q)) {
      if (w.length > 2) terms.add(w);
    }
  }

  const knowledge = medicalKnowledge as KnowledgeRow[];
  const scored = knowledge
    .map((item) => {
      const blob = [item.drug, item.topic, item.content, item.id]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (t.length < 2) continue;
        if (blob.includes(t)) {
          score += t.length > 3 ? 3 : 2;
        }
      }
      if (blob.includes(q)) score += 4;
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item)
    .slice(0, limit);

  if (scored.length > 0) return scored;

  return knowledge
    .filter(
      (item) =>
        item.content.toLowerCase().includes(q) ||
        item.drug.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
