# MediCoach

Base de proyecto para la hackathon: **Next.js (App Router)**, **shadcn/ui**, **Supabase** (Postgres + Auth + pgvector) y UI generada con **v0**.

## Requisitos

- Node 20+
- Cuenta [Supabase](https://supabase.com) y proyecto vacío
- (Opcional) [v0](https://v0.dev) para pantallas chat / dashboard / reporte

## Arranque local

```bash
cp .env.example .env.local
# Completá NEXT_PUBLIC_SUPABASE_* y, si aplica, SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Healthcheck: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Supabase

1. En el dashboard: **SQL** → pegá y ejecutá `supabase/schema.sql` (proyecto nuevo) **o** aplicá migraciones: `supabase db push` / ejecutá el SQL de `supabase/migrations/20260425120000_patient_profile_identity.sql` si tu proyecto ya existía.
2. Copiá **URL** y **anon key** (o publishable) a `.env.local`.
3. **Authentication → Providers**: activá **Email** (ya está por defecto).
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (o tu dominio en producción)
   - Redirect URLs: incluí `http://localhost:3000/auth/callback`
5. **Email Templates** (opcional): personalizá los emails de confirmación si querés que coincidan con tu marca.
6. **Límites de Auth (plan gratuito / pruebas):** Supabase limita **signups y envío de correos** por IP y por hora. Si ves error **429** o *"email rate limit exceeded"*, esperá unos minutos, evitá crear muchas cuentas de prueba seguidas o desactivá temporalmente **“Confirm email”** en *Authentication → Providers → Email* solo en desarrollo (no en producción sin analizar el riesgo).

Las tablas tienen **RLS** activado: el paciente solo accede a sus filas (`patient_profiles.id = auth.uid()`). El trigger `handle_new_user()` crea automáticamente el `patient_profile` al registrarse.

## v0 + shadcn

1. Generá componentes en v0 con los prompts del PDF **MediCoach_UX_UI_Guide** (chat, timeline, dashboard).
2. Exportá código a tu editor o copiá TSX en `components/` y componé en `app/dashboard`, `app/chat`, `app/report`.
3. Este repo ya tiene **shadcn** inicializado (`components.json`, Tailwind v4, tokens MediCoach en `app/globals.css`).

## Estructura del repo

| Área | Ruta |
|------|------|
| App Router (rutas, layouts) | `app/` |
| UI genérica (shadcn) | `components/ui/` |
| Layout compartido (header, shell) | `components/layout/` |
| UI por feature (chat, dashboard, …) | `components/features/<feature>/` |
| Dominio MediCoach (agente, RAG, FDA) | `lib/medicoach/` |
| Integraciones (Supabase, luego otros) | `lib/integrations/` |
| Supabase browser/server (compat) | `lib/supabase/*` re-exporta `lib/integrations/supabase/*` |
| Config estática (nav, flags) | `config/` |
| Tipos TS compartidos | `types/` |
| Hooks React | `hooks/` |
| Validación Zod API | `lib/validation/` |
| Scripts CLI (`tsx`) | `scripts/` |

## Arquitectura híbrida: MCP (Track 2) + tools internas

- **Requisito hackathon (v0 + MCPs, Track 2):** el **chat** en `POST /api/chat` no solo expone un endpoint en `/api/mcp`, sino que el agente, en el **servidor**, conecta por HTTP (Streamable HTTP) al **MCP remoto** del proyecto (por defecto: mismo origen + `/api/mcp`) y ejecuta ahí: `consultar_medicamento`, `detectar_interacciones` y `buscar_conocimiento`. Los logs JSON incluyen: `mcp_connected`, `mcp_tool_called`, `mcp_tool_failed`, `mcp_fallback_used`.
- **Resiliencia:** si MCP cae, esas tools **degradan** a openFDA y búsqueda en JSON local **sin** cortar el stream.
- **Datos de paciente (Supabase, service role):** `registrar_sintoma`, `obtener_historial` y `generar_url_reporte` **no** pasan por MCP; quedan como tools **internas** autenticadas con el usuario.
- **Variables (opcionales):** `MEDICOACH_MCP_URL` (default: origen de la request de chat + `/api/mcp`) y `MEDICOACH_MCP_TIMEOUT_MS` (default: `12000`).

## Agente y datos

- **Chat:** `POST /api/chat` — `streamText` (AI SDK v6) + tools: conocimiento y fármacos **vía MCP HTTP** (con fallback local), y tools de paciente: `registrar_sintoma`, `obtener_historial`, `generar_url_reporte` (ver sección *Arquitectura híbrida*).
- **MCP HTTP (Cursor, etc.):** `POST/GET` en `/api/mcp` (Streamable HTTP, `mcp-handler`).
- **Conocimiento curado:** `data/medical-knowledge.json` — entradas en español. La búsqueda local (`buscar_conocimiento` en fallback) usa sinónimos EN→ES; vía MCP el mismo JSON se consulta en el server MCP.
- **Detección de patrones:** `lib/medicoach/patterns.ts` — detecta síntomas repetidos (ej: 3+ mareos en 5 días) e inyecta alertas al system prompt.
- **Vercel AI Gateway (hackathon / Vercel):** si tenés `VERCEL_OIDC_TOKEN` (tras `vercel env pull`) o `AI_GATEWAY_API_KEY`, el chat usa modelos en formato `proveedor/modelo` **sin** `ANTHROPIC_API_KEY` ni `OPENAI_API_KEY`. Ver [AI Gateway](https://vercel.com/docs/ai-gateway) y variables en [`.env.example`](.env.example).

## Arquitectura simplificada (Fase 1-6 hackathon)

- **Sin LangGraph / RAG vectorial:** eliminados para simplificar. Conocimiento en JSON estático, búsqueda por texto.
- **6+ tools (híbrido MCP + internas):** fármacos e interacciones vía MCP (fallback local) + `registrar_sintoma` / `obtener_historial` / `generar_url_reporte` (internas, Supabase en servidor).
- **System prompt rioplatense:** tono empático, reglas de seguridad (no diagnóstico, no cambio de dosis, derivación a emergencias).
- **Cliente Supabase:** `lib/integrations/supabase/client.ts` (browser) y `server.ts` (Server Components / Route Handlers); `admin.ts` solo servidor con `SUPABASE_SERVICE_ROLE_KEY`.
- **Sesión:** `middleware.ts` → `lib/integrations/supabase/middleware.ts`.

## Deploy

Proyecto listo para [Vercel](https://vercel.com): definí las mismas variables de entorno en el dashboard del proyecto.

---

Montevideo · MediCoach · documentación de producto en los PDFs del workspace.
