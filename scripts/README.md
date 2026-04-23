Scripts Node / `tsx` (ingesta, migraciones auxiliares). Cargá variables desde `.env.local` en la misma shell (`export $(grep -v '^#' .env.local | xargs)` en macOS/Linux) y ejecutá:

- `npm run ingest:knowledge` — inserta filas demo en `medical_knowledge` (embeddings OpenAI).

Nunca commitear `SUPABASE_SERVICE_ROLE_KEY`.
