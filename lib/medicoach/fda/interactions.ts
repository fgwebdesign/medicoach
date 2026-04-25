function stripDiacritics(s: string) {
  // NFD separa letras y diacríticos; luego removemos los marks.
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(s: string) {
  return stripDiacritics(s).toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenizeDrugName(drugName: string) {
  const n = normalizeText(drugName);
  const pieces = n.split(/[^a-z0-9]+/g).filter(Boolean);

  // Evitar falsos positivos por tokens demasiado cortos (ej. "met").
  const tokens = new Set<string>();
  for (const p of pieces) {
    if (p.length >= 4) tokens.add(p);
  }

  // También agregamos el nombre completo normalizado si es razonable.
  if (n.length >= 4) tokens.add(n);

  return [...tokens];
}

export function mentionsDrug(text: string, drugName: string) {
  const t = normalizeText(text);
  if (!t) return false;

  const tokens = tokenizeDrugName(drugName);
  if (tokens.length === 0) return false;

  for (const token of tokens) {
    // Match por palabra completa para reducir falsos positivos.
    const re = new RegExp(`\\b${escapeRegExp(token)}\\b`, "i");
    if (re.test(t)) return true;
  }
  return false;
}

