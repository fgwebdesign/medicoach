/**
 * MediCoach — MCP (Model Context Protocol) sobre HTTP (Streamable HTTP / Vercel mcp-handler).
 *
 * - POST /api/mcp  → clientes MCP (JSON-RPC; Cursor, extensiones, etc.)
 * - GET  /api/mcp  → descubrimiento humano: nombre del server y lista de tools
 *
 * Conexión (ej. Cursor o cliente que soporte URL remota):
 *   { "mcpServers": { "medicoach": { "url": "https://<tu-dominio>/api/mcp" } } }
 *
 * Con cliente solo stdio, usar: npx -y mcp-remote https://<host>/api/mcp
 */
import { z } from "zod";
import { createMcpHandler } from "mcp-handler";
import medicalKnowledge from "@/data/medical-knowledge.json";
import { fetchDrugLabel } from "@/lib/medicoach/fda/client";

export const maxDuration = 60;

const toolMeta = {
  consultar_medicamento: {
    title: "Consultar medicamento",
    description:
      "Información oficial (openFDA) sobre un fármaco: efectos adversos, contraindicaciones, dosis.",
  },
  buscar_conocimiento: {
    title: "Buscar conocimiento",
    description:
      "Base curada en español (diabetes, hipertensión, medicación frecuente en LATAM).",
  },
} as const;

function searchKnowledge(query: string) {
  const q = query.toLowerCase();
  return (medicalKnowledge as Array<{
    id: string;
    drug: string;
    topic: string;
    content: string;
    source: string;
  }>)
    .filter(
      (item) =>
        item.content.toLowerCase().includes(q) ||
        item.drug.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q),
    )
    .slice(0, 4);
}

const mcp = createMcpHandler(
  (server) => {
    server.registerTool(
      "consultar_medicamento",
      {
        title: toolMeta.consultar_medicamento.title,
        description: toolMeta.consultar_medicamento.description,
        inputSchema: {
          nombre: z
            .string()
            .describe("Nombre del medicamento (ej. metformina, enalapril)"),
        },
      },
      async ({ nombre }) => {
        const data = await fetchDrugLabel(nombre);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(data, null, 0) },
          ],
        };
      },
    );

    server.registerTool(
      "buscar_conocimiento",
      {
        title: toolMeta.buscar_conocimiento.title,
        description: toolMeta.buscar_conocimiento.description,
        inputSchema: {
          query: z
            .string()
            .describe('Texto a buscar, ej. "mareos metformina"'),
        },
      },
      async ({ query }) => {
        const results = searchKnowledge(query);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { results, fuente: "MediCoach Knowledge Base (curado)" },
                null,
                0,
              ),
            },
          ],
        };
      },
    );
  },
  { serverInfo: { name: "medicoach", version: "0.1.0" } },
  { basePath: "/api", maxDuration: 60, verboseLogs: false },
);

export async function POST(request: Request) {
  return mcp(request);
}

/** Lista de tools y metadata para verificación / demo (no es parte del protocolo MCP estricto). */
export async function GET() {
  return Response.json({
    name: "MediCoach MCP",
    version: "0.1.0",
    post: "Usá POST con un cliente MCP (Streamable HTTP) en esta misma URL.",
    tools: [
      {
        name: "consultar_medicamento",
        ...toolMeta.consultar_medicamento,
        inputSchema: {
          type: "object",
          properties: {
            nombre: { type: "string", description: "Nombre del medicamento" },
          },
          required: ["nombre"],
        },
      },
      {
        name: "buscar_conocimiento",
        ...toolMeta.buscar_conocimiento,
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Consulta en español" },
          },
          required: ["query"],
        },
      },
    ],
  });
}
