/** Tools de conocimiento / fármacos expuestas por el MCP de MediCoach (mismo contrato que /api/mcp). */
export const MEDICOACH_MCP_KNOWLEDGE_TOOLS = [
  "consultar_medicamento",
  "detectar_interacciones",
  "buscar_conocimiento",
] as const;

export type MedicoachMcpKnowledgeToolName =
  (typeof MEDICOACH_MCP_KNOWLEDGE_TOOLS)[number];
