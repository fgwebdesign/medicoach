import { callMcpToolOnce } from "./mcp-tool-call";
import type { McpRuntimeConfig } from "./config";
import { mcpEventLog } from "./observability";
import type { MedicoachMcpKnowledgeToolName } from "./mcp-knowledge-tool-names";

/**
 * Intenta el servidor MCP (Track 2: el agente consume MCP en el flujo real del chat) y, si
 * la red, timeout o 5xx fallan, delega a la implementación local equivalente. No propaga
 * el fallo de MCP al usuario: el stream del chat continúa.
 */
export async function mcpOrFallback<T>(options: {
  mcp: McpRuntimeConfig | undefined;
  toolName: MedicoachMcpKnowledgeToolName;
  args: Record<string, unknown>;
  local: () => Promise<T>;
}): Promise<T> {
  if (!options.mcp) {
    return options.local();
  }
  try {
    return (await callMcpToolOnce(
      options.mcp,
      options.toolName,
      options.args,
    )) as T;
  } catch {
    mcpEventLog("mcp_fallback_used", {
      tool: options.toolName,
      reason: "mcp_error",
    });
    return options.local();
  }
}
