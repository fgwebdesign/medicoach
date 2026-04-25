/**
 * Iniciales para avatar (2 caracteres, mayúsculas).
 * Soporta `nombre.apellido@` o prefijo con letras.
 */
export function getInitialsFromEmail(email: string | null | undefined): string {
  if (!email?.trim()) return "?";
  const local = (email.split("@")[0] ?? "").trim();
  if (!local) return "?";

  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = (parts[0] ?? "").replace(/[^a-zA-ZáéíóúÑñüÜ]/g, "");
    const second = (parts[1] ?? "").replace(/[^a-zA-ZáéíóúÑñüÜ]/g, "");
    if (first[0] && second[0]) {
      return (first[0] + second[0]).toLocaleUpperCase("es");
    }
  }

  const letters = local.replace(/[^a-zA-ZáéíóúÑñüÜü]/g, "");
  if (letters.length >= 2) {
    return letters.slice(0, 2).toLocaleUpperCase("es");
  }
  if (letters.length === 1) {
    return (letters[0] + letters[0]).toLocaleUpperCase("es");
  }
  return local.slice(0, 2).toLocaleUpperCase("es");
}
