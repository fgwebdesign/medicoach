import { describe, expect, it } from "vitest";
import { parseMcpToolTextPayload } from "./mcp-tool-call";
import type { Client } from "@modelcontextprotocol/sdk/client";

type CallToolR = Awaited<ReturnType<Client["callTool"]>>;

describe("parseMcpToolTextPayload", () => {
  it("parsea el primer bloque de texto JSON", () => {
    const ok = {
      content: [
        { type: "text" as const, text: JSON.stringify({ a: 1, b: "x" }) },
      ],
    } as CallToolR;
    expect(parseMcpToolTextPayload(ok)).toEqual({ a: 1, b: "x" });
  });

  it("rechaza isError: true con mensaje de texto", () => {
    const err = {
      isError: true,
      content: [
        { type: "text" as const, text: JSON.stringify({ n: "e" }) },
      ],
    } as CallToolR;
    expect(() => parseMcpToolTextPayload(err)).toThrow();
  });
});
