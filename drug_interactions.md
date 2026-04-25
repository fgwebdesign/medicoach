## Estado en el repo (revisión)

**Implementado.** `fetchDrugInteractions` está en `lib/medicoach/fda/client.ts` y el matching con `mentionsDrug` en `lib/medicoach/fda/interactions.ts`.

- **MCP** (`app/api/mcp/route.ts`): `registerTool("detectar_interacciones", …)` devuelve `content: [{ type: "text", text: JSON.stringify(resultado) }]` igual que `consultar_medicamento` y `buscar_conocimiento`; `GET /api/mcp` lista la tool con su `inputSchema`.
- **Chat** (`lib/medicoach/agent/chat-tools.ts`): el mismo tool usa `mcpOrFallback` con `toolName: "detectar_interacciones"` y `args: { medicamento1, medicamento2 }` — el mismo criterio que el resto de tools expuestas vía MCP (intento al servidor HTTP + fallback a `localDetectarInteracciones` si MCP falla).

Lo que sigue abajo es el **diseño original** (se conserva como referencia de decisiones: tokenizado, estructura de respuesta, etc.).

---

Objetivo

Exponer una tool `detectar_interacciones(medicamento1, medicamento2)` que consulte openFDA Drug Label para ambos fármacos y determine si hay interacción conocida por mención en la sección `drug_interactions` de cualquiera de las dos etiquetas.

Dónde vive hoy





Tools del agente (Vercel AI SDK): [lib/medicoach/agent/chat-tools.ts](lib/medicoach/agent/chat-tools.ts)



MCP server para Cursor (Streamable HTTP / mcp-handler): [app/api/mcp/route.ts](app/api/mcp/route.ts)



Cliente openFDA: `fetchDrugLabel` y `fetchDrugInteractions` en [lib/medicoach/fda/client.ts](lib/medicoach/fda/client.ts) (el segundo aporta `drug_interactions` para este tool).

Cambios propuestos

1) Extender el cliente openFDA con drug_interactions





En [lib/medicoach/fda/client.ts](lib/medicoach/fda/client.ts) agregar una función nueva, sin romper el contrato actual de fetchDrugLabel:





fetchDrugInteractions(genericName: string): Promise<{ nombre: string; drug_interactions?: string; fuente: string } | { error: string; nombre: string }>



Implementación: mismo endpoint/timeout/api_key que fetchDrugLabel, pero parseando results[0].drug_interactions?.[0].



Motivo: tu snippet depende de label1?.drug_interactions?.[0], que hoy no existe en DrugLabelDetail.

2) Implementar el matching tokenizado (robusto)





Crear helper puro (idealmente en el mismo archivo de tool o en lib/medicoach/fda/):





Normalizar: toLowerCase(), colapsar espacios, quitar puntuación.



Tokenizar el nombre del medicamento en palabras (p.ej. split por no-alfanumérico) y quedarnos con tokens relevantes (p.ej. largo >= 4), además del nombre completo.



Detectar interacción si cualquier token relevante de med2 aparece como palabra completa en el texto de interacciones de med1, o viceversa.



Implementar check por regex de palabra (\btoken\b) con escaping seguro.



Resultado: reduce falsos positivos de includes (ej. met en metformin).

3) Agregar la tool a las tools del chat





En [lib/medicoach/agent/chat-tools.ts](lib/medicoach/agent/chat-tools.ts), dentro de createMediCoachTools, agregar:





detectar_interacciones: tool({ description, inputSchema: z.object({ medicamento1: z.string(), medicamento2: z.string() }), execute })



execute:





Promise.all([fetchDrugInteractions(m1), fetchDrugInteractions(m2)])



Construir interaccion_detectada usando helper tokenizado.



Devolver:





medicamento1, medicamento2



interaccion_detectada



detalle1, detalle2 (clip 400 o fallback “Sin datos de interacciones en FDA”)



fuente: 'openFDA Drug Label'



Manejar errores devolviendo { error, medicamento1, medicamento2 } de forma consistente.

4) Exponer la tool en el MCP server para Cursor





En [app/api/mcp/route.ts](app/api/mcp/route.ts):





Extender toolMeta con detectar_interacciones (title/description).



Registrar server.registerTool('detectar_interacciones', { ... }, handler).



En el handler, devolver content: [{ type: 'text', text: JSON.stringify(resultado) }] como las otras tools.



Extender la respuesta de GET (lista demo) para incluir la nueva tool y su inputSchema.

Notas de compatibilidad





En este repo las tools del chat usan inputSchema (no parameters). Mantengo el estilo del repo para que compile con Vercel AI SDK actual.



No se toca fetchDrugLabel para evitar side-effects en consultar_medicamento.

Test plan





Llamada directa a MCP (manual): POST /api/mcp con tools/list y verificar que aparece detectar_interacciones.



tools/call con un par conocido (ej. warfarin + ibuprofen) y validar que detalle1/2 contienen texto útil y interaccion_detectada es razonable.



Desde chat UI: provocar que el agente llame la tool (o invocarla manualmente si hay UI para tools) y verificar formato de respuesta.