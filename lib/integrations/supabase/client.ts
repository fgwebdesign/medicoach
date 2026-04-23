import { createBrowserClient } from "@supabase/ssr";

/** Cliente Supabase para el browser (anon / publishable). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y la clave pública (anon o publishable) en el entorno.",
    );
  }

  return createBrowserClient(url, key);
}
