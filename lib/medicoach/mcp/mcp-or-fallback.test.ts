import { beforeEach, describe, expect, it, vi } from "vitest";

const callMcpToolOnce = vi.hoisted(() => vi.fn());

vi.mock("./mcp-tool-call", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./mcp-tool-call")>();
  return { ...mod, callMcpToolOnce };
});

import { mcpOrFallback } from "./mcp-or-fallback";

const mcp = { mcpBaseUrl: "https://app.example.com/api/mcp", timeoutMs: 5_000 };

describe("mcpOrFallback", () => {
  beforeEach(() => {
    callMcpToolOnce.mockReset();
  });

  it("devuelve resultado MCP en éxito", async () => {
    callMcpToolOnce.mockResolvedValueOnce({ vía: "mcp" });
    const local = vi.fn().mockResolvedValue({ vía: "local" });

    const r = await mcpOrFallback({
      mcp,
      toolName: "consultar_medicamento",
      args: { nombre: "x" },
      local,
    });

    expect(r).toEqual({ vía: "mcp" });
    expect(local).not.toHaveBeenCalled();
  });

  it("usa la implementación local si MCP no responde (log mcp_fallback_used)", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    callMcpToolOnce.mockRejectedValueOnce(new Error("connection refused"));
    const local = vi.fn().mockResolvedValue({ vía: "local" });

    const r = await mcpOrFallback({
      mcp,
      toolName: "buscar_conocimiento",
      args: { query: "x" },
      local,
    });

    expect(r).toEqual({ vía: "local" });
    expect(local).toHaveBeenCalled();
    const payload = logSpy.mock.calls
      .map((c) => c[0])
      .find((p) => typeof p === "string" && p.includes("mcp_fallback_used"));
    expect(payload).toBeDefined();
    logSpy.mockRestore();
  });

  it("omite MCP si mcp no está definido (solo local)", async () => {
    callMcpToolOnce.mockResolvedValue({ vía: "mcp" });
    const local = vi.fn().mockResolvedValue({ vía: "local" });

    const r = await mcpOrFallback({
      mcp: undefined,
      toolName: "consultar_medicamento",
      args: { nombre: "x" },
      local,
    });

    expect(r).toEqual({ vía: "local" });
    expect(callMcpToolOnce).not.toHaveBeenCalled();
  });
});
