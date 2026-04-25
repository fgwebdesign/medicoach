/**
 * Integración: POST /api/chat resuelve URL de MCP desde la request y pasa
 * { mcpBaseUrl, timeoutMs } a createMediCoachTools (conexión Track 2 al servidor MCP en runtime).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mcpCapture = vi.hoisted(
  () =>
    [] as Array<{
      mcp?: { mcpBaseUrl: string; timeoutMs: number };
      patientId?: string;
    }>,
);

vi.mock("@/lib/medicoach/agent/chat-tools", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/medicoach/agent/chat-tools")>();
  return {
    createMediCoachTools: (ctx: Parameters<typeof mod.createMediCoachTools>[0]) => {
      const c = ctx ?? {};
      mcpCapture.push({ mcp: c.mcp, patientId: c.patientId });
      return mod.createMediCoachTools(c);
    },
  };
});

vi.mock("@/lib/integrations/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "patient-integ-1" } },
        }),
      },
    }),
  ),
}));

vi.mock("@/lib/medicoach/patterns", () => ({
  detectPatterns: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/medicoach/agent/prompts", () => ({
  getMediCoachSystemPrompt: () => "System prompt de prueba. ",
  formatPatternContext: () => "",
}));

vi.mock("@/lib/medicoach/persistence/chat-session", () => ({
  persistChatTurn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/medicoach/ai/models", () => ({
  resolveChatModel: () => "openai/gpt-4o-mini" as const,
}));

vi.mock("ai", async (importOriginal) => {
  const ai = await importOriginal<typeof import("ai")>();
  return {
    ...ai,
    streamText: vi.fn().mockReturnValue({
      toUIMessageStreamResponse: () =>
        new Response(null, { status: 200, statusText: "OK" }),
    }),
  };
});

describe("POST /api/chat (integración MCP)", () => {
  beforeEach(() => {
    mcpCapture.length = 0;
    process.env.OPENAI_API_KEY = "sk-test-key-for-vitest";
    delete process.env.MEDICOACH_MCP_URL;
    delete process.env.MEDICOACH_MCP_TIMEOUT_MS;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.MEDICOACH_MCP_URL;
    delete process.env.MEDICOACH_MCP_TIMEOUT_MS;
  });

  it("pasa a las tools mcp = origen de la request + /api/mcp (sin MEDICOACH_MCP_URL)", async () => {
    const { POST } = await import("./route");

    const body = {
      messages: [
        {
          id: "m-1",
          role: "user" as const,
          parts: [{ type: "text" as const, text: "hola" }],
        },
      ],
      locale: "es" as const,
    };

    const res = await POST(
      new Request("https://app.example.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

    expect(res.status).toBe(200);
    expect(mcpCapture).toHaveLength(1);
    expect(mcpCapture[0]!.patientId).toBe("patient-integ-1");
    expect(mcpCapture[0]!.mcp).toEqual({
      mcpBaseUrl: "https://app.example.com/api/mcp",
      timeoutMs: 12_000,
    });
  });

  it("usa MEDICOACH_MCP_URL y MEDICOACH_MCP_TIMEOUT_MS cuando están definidos", async () => {
    process.env.MEDICOACH_MCP_URL = "https://mcp.remote.test/v1/mcp";
    process.env.MEDICOACH_MCP_TIMEOUT_MS = "5000";

    const { POST } = await import("./route");
    const res = await POST(
      new Request("https://otro.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "m-1",
              role: "user",
              parts: [{ type: "text", text: "test" }],
            },
          ],
          locale: "es",
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(mcpCapture[0]!.mcp).toEqual({
      mcpBaseUrl: "https://mcp.remote.test/v1/mcp",
      timeoutMs: 5000,
    });
  });
});
