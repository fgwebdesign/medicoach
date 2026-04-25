import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

/**
 * Supabase con cookies leídas del `Request` del Route Handler.
 * En despliegues (p. ej. Vercel) alinea mejor con la cabecera `Cookie` entrante
 * que un `cookies()` aislado en ciertos `POST` / streaming.
 */
export function createClientFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y la clave pública (anon o publishable) en el entorno.",
    );
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        /* Re-emisión de Set-Cookie: el `middleware` ya llama a `getUser` y
           renueva en visitas; las respuestas API JSON suelen leer la sesión con getAll. */
      },
    },
  });
}
