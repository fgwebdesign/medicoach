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
3. Para scripts de ingesta MedQuAD / embeddings, usá `SUPABASE_SERVICE_ROLE_KEY` solo en servidor o en CLI local — no la subas a repositorios públicos ni a `NEXT_PUBLIC_*`.

Las tablas tienen **RLS** activado: el paciente solo accede a sus filas (`patient_profiles.id = auth.uid()`). La tabla `medical_knowledge` no tiene políticas de lectura directa; la búsqueda va por la función `search_medical_knowledge`.

## v0 + shadcn

1. Generá componentes en v0 con los prompts del PDF **MediCoach_UX_UI_Guide** (chat, timeline, dashboard).
2. Exportá código a tu editor o copiá TSX en `components/` y componé en `app/dashboard`, `app/chat`, `app/report`.
3. Este repo ya tiene **shadcn** inicializado (`components.json`, Tailwind v4, tokens MediCoach en `app/globals.css`).

## Próximo cableado

- **Agente:** `app/api/chat/route.ts` (LangGraph + Vercel AI SDK + streaming).
- **Cliente Supabase:** `lib/supabase/client.ts` (browser) y `lib/supabase/server.ts` (Server Components / Route Handlers).
- **Sesión:** `middleware.ts` refresca cookies de Supabase Auth.

## Deploy

Proyecto listo para [Vercel](https://vercel.com): definí las mismas variables de entorno en el dashboard del proyecto.

---

Montevideo · MediCoach · documentación de producto en los PDFs del workspace.
