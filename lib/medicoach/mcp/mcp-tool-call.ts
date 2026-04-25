import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { McpRuntimeConfig } from "./config";
import { mcpEventLog } from "./observability";
import type { MedicoachMcpKnowledgeToolName } from "./mcp-knowledge-tool-names";

type McpCallToolResult = Awaited<ReturnType<Client["callTool"]>>;

/**
 * Convierte el payload textual JSON del server MCP a valor JS (mismo formato que en app/api/mcp).
 */
export function parseMcpToolTextPayload(result: McpCallToolResult): unknown {
  if (result && typeof result === "object" && "isError" in result) {
    const isErr = (result as { isError?: boolean }).isError;
    if (isErr) {
      const text = extractFirstText(
        (result as { content?: { type: string; text?: string }[] }).content,
      );
      throw new Error(text || "MCP tool isError: true");
    }
  }
  if (!result || typeof result !== "object" || !("content" in result)) {
    throw new Error("MCP: respuesta sin content");
  }
  const text = extractFirstText(
    (result as { content: { type: string; text?: string }[] }).content,
  );
  if (!text) {
    throw new Error("MCP: sin bloque de texto en content");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    throw new Error(
      `MCP: JSON inválido en content: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

function extractFirstText(
  content: { type: string; text?: string }[] | undefined,
): string {
  if (!Array.isArray(content)) return "";
  const block = content.find((c) => c.type === "text" && c.text);
  return block?.text?.trim() ?? "";
}

/**
 * Una sesión MCP por llamada: conecta al endpoint Streamable HTTP, ejecuta un tool, cierra.
 * Debe correr solo en el servidor; nunca exponer al cliente.
 */
export async function callMcpToolOnce(
  mcp: McpRuntimeConfig,
  toolName: MedicoachMcpKnowledgeToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  const endpoint = new URL(mcp.mcpBaseUrl);
  const client = new Client({ name: "medicoach-chat", version: "0.1.0" });
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), mcp.timeoutMs);
  const transport = new StreamableHTTPClientTransport(endpoint, {
    requestInit: { signal: ac.signal },
  });
  const safePath = endpoint.pathname;
  const origin = endpoint.origin;

  try {
    await client.connect(transport);
    mcpEventLog("mcp_connected", {
      mcpBaseUrl: `${origin}${safePath}`,
      toolName,
    });

    const result = await client.callTool(
      { name: toolName, arguments: args },
      undefined,
      {
        signal: ac.signal,
        timeout: mcp.timeoutMs,
        maxTotalTimeout: mcp.timeoutMs,
      },
    );
    mcpEventLog("mcp_tool_called", {
      toolName,
      mcpBaseUrl: `${origin}${safePath}`,
    });
    return parseMcpToolTextPayload(result);
  } catch (e) {
    mcpEventLog("mcp_tool_failed", {
      toolName,
      mcpBaseUrl: `${origin}${safePath}`,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  } finally {
    clearTimeout(timer);
    try {
      await transport.close();
    } catch {
      /* ok */
    }
  }
}
