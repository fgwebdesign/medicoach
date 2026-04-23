# Colección Bruno — MediCoach

1. Abrí [Bruno](https://www.usebruno.com/) → **Open Collection** → carpeta `bruno/MediCoach/`.
2. Elegí el entorno **Local** (`baseUrl` = `http://localhost:3000`).
3. Levantá el app: `npm run dev`.

## Carpetas

| Carpeta | Qué probás |
|---------|-------------|
| **App** | Rutas de este repo (`/api/health`, `/api/chat`). |
| **External** | APIs públicas (openFDA, RxNorm) sin pasar por Next. |

## Estado del backend (importante)

- **`GET /api/health`**: listo, devuelve `{ ok: true }`.
- **`POST /api/chat`**: **streaming UI** (Vercel AI SDK + Claude + tools RAG/openFDA). Requiere `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` y Supabase en `.env.local`. Respuesta SSE compatible con Bruno como “text stream” según versión del cliente.
- **Datos RAG en Supabase**: la tabla `medical_knowledge` existe en el proyecto migrado, pero **no hay ingesta automática** en el repo todavía (no hay script `scripts/ingest-*.ts` ni filas salvo que las cargues a mano / SQL).

## openFDA con más cuota

En la request **openFDA Drug Label** podés añadir en la URL (query) `&api_key=TU_CLAVE` (gratis en [open.fda.gov](https://open.fda.gov/apis/authentication/)), o duplicar la request en Bruno y guardar la clave en variables de entorno del entorno Local.

## Fuentes de datos (sin scraping para el MVP)

Según la guía del producto:

- **APIs en vivo**: openFDA, RxNorm, MedlinePlus — **HTTP oficiales**, no hace falta scraper.
- **RAG “estático”**: **MedQuAD** (descarga JSON/dataset desde GitHub), **DailyMed** (descarga SPL/XML) — ingestión batch a Supabase + embeddings; tampoco es scraping de sitios arbitrarios.

Si querés “probar el modelo” hoy, el siguiente paso de código es implementar `POST /api/chat` con streaming y claves `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` en `.env.local`.
