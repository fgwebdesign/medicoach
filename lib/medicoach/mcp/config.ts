const DEFAULT_MCP_PATH = "/api/mcp";
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * URL base del servidor MCP que expone el chat en runtime.
 * - `MEDICOACH_MCP_URL` opcional: URL completa (ej. https://tudominio.com/api/mcp o http://host.docker.internal:3000/api/mcp en demo).
 * - Si no se define, se usa el origen de la request HTTP actual + /api/mcp (mismo deploy).
 */
export function resolveMcpBaseUrl(incomingRequestUrl: string): string {
  const fromEnv = process.env.MEDICOACH_MCP_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return new URL(DEFAULT_MCP_PATH, incomingRequestUrl).href;
}

export function getMcpTimeoutMs(): number {
  const raw = process.env.MEDICOACH_MCP_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      return Math.min(Math.floor(n), 120_000);
    }
  }
  return DEFAULT_TIMEOUT_MS;
}

export type McpRuntimeConfig = {
  mcpBaseUrl: string;
  timeoutMs: number;
};
