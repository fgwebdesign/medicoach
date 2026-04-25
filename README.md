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

1. En el dashboard: **SQL** → pegá y ejecutá `supabase/schema.sql`.
2. Copiá **URL** y **anon key** (o publishable) a `.env.local`.
3. **Authentication → Providers**: activá **Email** (ya está por defecto).
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (o tu dominio en producción)
   - Redirect URLs: incluí `http://localhost:3000/auth/callback`
5. **Email Templates** (opcional): personalizá los emails de confirmación si querés que coincidan con tu marca.

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

## Agente y datos

- **Chat:** `POST /api/chat` — `streamText` (AI SDK v6) + 5 tools: `consultar_medicamento` (openFDA), `buscar_conocimiento` (JSON estático), `registrar_sintoma`, `obtener_historial`, `generar_url_reporte`.
- **Conocimiento curado:** `data/medical-knowledge.json` — 35 entradas en español sobre medicamentos comunes para diabetes/HTA. Búsqueda por texto simple (sin embeddings).
- **Detección de patrones:** `lib/medicoach/patterns.ts` — detecta síntomas repetidos (ej: 3+ mareos en 5 días) e inyecta alertas al system prompt.
- **Vercel AI Gateway (hackathon / Vercel):** si tenés `VERCEL_OIDC_TOKEN` (tras `vercel env pull`) o `AI_GATEWAY_API_KEY`, el chat usa modelos en formato `proveedor/modelo` **sin** `ANTHROPIC_API_KEY` ni `OPENAI_API_KEY`. Ver [AI Gateway](https://vercel.com/docs/ai-gateway) y variables en [`.env.example`](.env.example).

## Arquitectura simplificada (Fase 1-6 hackathon)

- **Sin LangGraph / RAG vectorial:** eliminados para simplificar. Conocimiento en JSON estático, búsqueda por texto.
- **5 tools funcionales:** el agente puede consultar openFDA, buscar en conocimiento curado, registrar síntomas, obtener historial y generar reporte.
- **System prompt rioplatense:** tono empático, reglas de seguridad (no diagnóstico, no cambio de dosis, derivación a emergencias).
- **Cliente Supabase:** `lib/integrations/supabase/client.ts` (browser) y `server.ts` (Server Components / Route Handlers); `admin.ts` solo servidor con `SUPABASE_SERVICE_ROLE_KEY`.
- **Sesión:** `middleware.ts` → `lib/integrations/supabase/middleware.ts`.

## Deploy

Proyecto listo para [Vercel](https://vercel.com): definí las mismas variables de entorno en el dashboard del proyecto.

---

Montevideo · MediCoach · documentación de producto en los PDFs del workspace.
