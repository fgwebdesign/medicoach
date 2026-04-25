import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function supabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, key };
}

/**
 * Intercambia `code` (PKCE del magic link) por sesión.
 *
 * Importante en App Router: las cookies de sesión tienen que ir en el mismo
 * `NextResponse` que el redirect; `cookies()` del handler no siempre las
 * adjunta al 302 (patrón oficial @supabase/ssr + middleware).
 *
 * Supabase Dashboard → Authentication → URL configuration:
 * - Site URL: http://localhost:3000 (o tu dominio)
 * - Redirect URLs: incluir http://localhost:3000/auth/callback
 */
export async function GET(request: NextRequest) {
  const { url, key } = supabasePublicEnv();
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const oauthErr =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  if (oauthErr) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthErr)}`,
    );
  }

  if (!url || !key) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Faltan NEXT_PUBLIC_SUPABASE_URL o la clave pública (anon / publishable).")}`,
    );
  }

  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const nextPath =
    nextParam?.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Enlace incompleto o expirado. Pedí un nuevo correo desde Entrar.")}`,
    );
  }

  const redirectTarget = `${origin}${nextPath}`;
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return response;
}
