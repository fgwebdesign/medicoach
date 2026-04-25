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
import {
  fetchDrugInteractions,
  fetchDrugLabel,
} from "@/lib/medicoach/fda/client";
import { mentionsDrug } from "@/lib/medicoach/fda/interactions";

export const maxDuration = 60;

const toolMeta = {
  consultar_medicamento: {
    title: "Consultar medicamento",
    description:
      "Información oficial (openFDA) sobre un fármaco: efectos adversos, contraindicaciones, dosis.",
  },
  detectar_interacciones: {
    title: "Detectar interacciones",
    description:
      "Verifica si dos medicamentos tienen interacciones conocidas consultando openFDA (sección drug_interactions).",
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
      "detectar_interacciones",
      {
        title: toolMeta.detectar_interacciones.title,
        description: toolMeta.detectar_interacciones.description,
        inputSchema: {
          medicamento1: z.string().describe("Primer medicamento (ej. warfarin)"),
          medicamento2: z.string().describe("Segundo medicamento (ej. ibuprofen)"),
        },
      },
      async ({ medicamento1, medicamento2 }) => {
        const [label1, label2] = await Promise.all([
          fetchDrugInteractions(medicamento1),
          fetchDrugInteractions(medicamento2),
        ]);

        const warnings1 =
          "error" in label1 ? "" : (label1.drug_interactions ?? "");
        const warnings2 =
          "error" in label2 ? "" : (label2.drug_interactions ?? "");

        const interaccion =
          mentionsDrug(warnings1, medicamento2) ||
          mentionsDrug(warnings2, medicamento1);

        const detailFrom = (label: typeof label1, warnings: string) => {
          if ("error" in label) return `Error openFDA: ${label.error}`.slice(0, 400);
          return warnings.slice(0, 400) || "Sin datos de interacciones en FDA";
        };

        const result = {
          medicamento1,
          medicamento2,
          interaccion_detectada: interaccion,
          detalle1: detailFrom(label1, warnings1),
          detalle2: detailFrom(label2, warnings2),
          fuente: "openFDA Drug Label",
        };

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 0) },
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
        name: "detectar_interacciones",
        ...toolMeta.detectar_interacciones,
        inputSchema: {
          type: "object",
          properties: {
            medicamento1: {
              type: "string",
              description: "Primer medicamento",
            },
            medicamento2: {
              type: "string",
              description: "Segundo medicamento",
            },
          },
          required: ["medicamento1", "medicamento2"],
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
