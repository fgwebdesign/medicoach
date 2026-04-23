# Dominio MediCoach (`lib/medicoach`)

Código de negocio del producto, separado de integraciones (`lib/integrations`) y de la UI (`components/features`).

| Carpeta   | Responsabilidad |
|-----------|-----------------|
| `agent/`  | LangGraph, prompts del sistema, orquestación del flujo conversacional |
| `rag/`    | Embeddings, búsqueda vectorial vía Supabase, ingesta de conocimiento |
| `fda/`    | Cliente y tipos para openFDA (y luego RxNorm si aplica) |

Las rutas HTTP delgadas viven en `app/api/*` y solo delegan aquí.
