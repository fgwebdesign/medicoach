import { beforeEach, describe, expect, it, vi } from "vitest";

const mcpOrFallback = vi.hoisted(() => vi.fn());

vi.mock("@/lib/medicoach/mcp/mcp-or-fallback", () => ({ mcpOrFallback }));

import { createMediCoachTools } from "./chat-tools";

const mcp = { mcpBaseUrl: "https://x.test/api/mcp", timeoutMs: 1 };

describe("createMediCoachTools — vía MCP (mockeada)", () => {
  beforeEach(() => mcpOrFallback.mockReset());

  it("consultar_medicamento: usa mcpOrFallback (Track 2: traza hacia el servidor MCP)", async () => {
    mcpOrFallback.mockImplementation(
      async (opts: { toolName?: string; args?: { nombre: string } }) => {
        if (opts?.toolName === "consultar_medicamento") {
          return {
            source: "mcp",
            nombre: opts.args?.nombre,
          };
        }
        if (typeof (opts as { local?: () => Promise<unknown> } | null)?.local === "function") {
          return (opts as { local: () => Promise<unknown> }).local();
        }
        return undefined;
      },
    );
    const tools = createMediCoachTools({ mcp, locale: "es" });
    const out = await tools.consultar_medicamento.execute?.(
      { nombre: "metformina" },
      {} as never,
    );
    const mcpCall = mcpOrFallback.mock.calls
      .map((c) => c[0] as { toolName?: string; args?: { nombre: string } })
      .find((o) => o?.toolName === "consultar_medicamento");
    expect(mcpCall).toBeDefined();
    expect(mcpCall).toEqual(
      expect.objectContaining({
        toolName: "consultar_medicamento",
        args: { nombre: "metformina" },
      }),
    );
    expect(out).toEqual({ source: "mcp", nombre: "metformina" });
  });
});
