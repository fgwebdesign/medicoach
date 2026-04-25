/**
 * Eventos estructurados para demos / hackathon (Track 2) y trazas en Vercel.
 * Buscá en logs: mcp_connected | mcp_tool_called | mcp_tool_failed | mcp_fallback_used
 */
export type McpObservabilityEvent =
  | "mcp_connected"
  | "mcp_tool_called"
  | "mcp_tool_failed"
  | "mcp_fallback_used";

export function mcpEventLog(
  event: McpObservabilityEvent,
  payload: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    event,
    ...payload,
    ts: new Date().toISOString(),
  });
  if (event === "mcp_tool_failed") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
