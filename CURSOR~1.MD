# Prompt para Cursor — Refactor MediCoach para Hackathon

Pegale esto a Cursor (en agent mode si tenés). Está dividido en fases para que ejecute en orden y verifique entre cada una.

---

## Contexto del proyecto

Estoy en una hackathon de 4 horas para construir **MediCoach**, un agente de IA conversacional para pacientes con enfermedades crónicas (diabetes + hipertensión). El repo actual tiene la UI base hecha pero el backend tiene complejidad innecesaria que no vamos a usar (LangGraph, pgvector, embeddings con OpenAI). Necesito simplificar agresivamente para llegar al pitch.

**Stack que mantengo**: Next.js 16 (App Router), React 19, Supabase (Postgres + Auth, sin pgvector), Vercel AI SDK v6, Tailwind CSS 4, shadcn/ui, AI Gateway de Vercel para Claude.

**Track de la hackathon**: Vercel Track 2 (v0 + MCPs). Por eso necesito un MCP server propio.

**Caso de demo**: María González, 62 años, diabetes tipo 2 + hipertensión, toma Metformina 850mg (2x/día) y Enalapril 10mg. Reportó mareos 3 días seguidos después de Metformina. Demo ideal: María chatea, agente registra síntoma, consulta openFDA en vivo, detecta patrón de 3 días, ofrece generar reporte PDF para el médico.

---

## Constraints — qué NO tocar

- Toda la UI de `app/` (paginas, layouts) salvo `/dashboard` y `/report` que están como placeholder
- `components/features/chat/medichat.tsx` — el cliente de chat funciona bien
- `components/features/auth/login-form.tsx` y todo el flujo de auth Supabase
- `components/layout/site-header.tsx`
- `middleware.ts` y `lib/integrations/supabase/middleware.ts`
- Todos los componentes en `components/ui/`* (shadcn)
- Las tablas Supabase `patient_profiles`, `medications`, `symptoms`, `chat_sessions` — quedan como están
- Las migraciones existentes en `supabase/migrations/` — NO crear nuevas migraciones que rompan estas

---

## FASE 1 — Limpieza: borrar lo que no usamos

Borrá los siguientes archivos completamente (vamos a reemplazar la lógica por una más simple):

```
lib/medicoach/agent/graph.ts           # LangGraph — bypass total
lib/medicoach/rag/embed.ts             # embeddings OpenAI — no usamos
lib/medicoach/rag/search.ts            # pgvector RPC — no usamos
scripts/ingest-knowledge.ts            # ingesta de embeddings — no corremos
scripts/fetch-openfda-knowledge.ts     # no usamos chunks pre-procesados
data/knowledge/mvp-curated.json        # si existe, borrar
data/knowledge/openfda-chunks.json     # si existe, borrar
```

Si la carpeta `lib/medicoach/rag/` queda vacía, borrarla.
Si la carpeta `data/knowledge/` queda vacía, borrarla.

Quitá del `package.json` las siguientes dependencias (y corré `npm install` después):

```
@langchain/langgraph
@langchain/core
```

Dejá `@ai-sdk/openai` por si la usamos para embeddings de respaldo, pero no la importes en ningún lado.

Verificá que el proyecto compile (`npm run build`) después de esta fase. Es probable que `app/api/chat/route.ts` rompa porque importa `runIntentGraph` y la función de búsqueda RAG — eso lo arreglamos en la Fase 2.

---

## FASE 2 — Simplificar `/api/chat`

Reescribí `app/api/chat/route.ts` para que sea **solo AI SDK 6 puro con tool calling directo**, sin LangGraph y sin RAG con pgvector.

Estructura nueva:

```ts
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { resolveChatModel } from '@/lib/medicoach/ai/models';
import { createMediCoachTools } from '@/lib/medicoach/agent/chat-tools';
import { MEDICOACH_SYSTEM_PROMPT } from '@/lib/medicoach/agent/prompts';
import { detectPatterns } from '@/lib/medicoach/patterns';
import { persistChatTurn } from '@/lib/medicoach/persistence/chat-session';
import { createClient } from '@/lib/integrations/supabase/server';
import { chatRequestSchema } from '@/lib/validation/chat-request';

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, sessionId } = chatRequestSchema.parse(body);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Detección de patrones inyectada al system prompt como contexto extra
  let patternContext = '';
  if (user) {
    const patterns = await detectPatterns(user.id);
    if (patterns.length > 0) {
      patternContext = `\n\nALERTAS DETECTADAS EN ESTE PACIENTE:\n` +
        patterns.map(p => `- "${p.sintoma}" reportado ${p.count} veces en últimos 5 días (severidad promedio ${p.severidadPromedio.toFixed(1)})`).join('\n') +
        `\nMencioná estas alertas naturalmente en tu respuesta si son relevantes.`;
    }
  }

  const result = streamText({
    model: resolveChatModel(),
    system: MEDICOACH_SYSTEM_PROMPT + patternContext,
    messages: convertToModelMessages(messages),
    tools: createMediCoachTools({ patientId: user?.id }),
    stopWhen: stepCountIs(8),
    onFinish: async ({ text }) => {
      if (user) {
        await persistChatTurn({ sessionId, patientId: user.id, messages, assistantText: text });
      }
    },
  });

  return result.toDataStreamResponse();
}
```

Asegurate de que `resolveChatModel` siga funcionando (usa el AI Gateway). Si tira error porque busca `resolveEmbeddingModel`, removelo del archivo `lib/medicoach/ai/models.ts` también.

---

## FASE 3 — Reescribir las tools del agente

Reemplazá completamente `lib/medicoach/agent/chat-tools.ts` con esta nueva versión:

```ts
import { tool } from 'ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/integrations/supabase/admin';
import { fetchDrugLabel } from '@/lib/medicoach/fda/client';
import medicalKnowledge from '@/data/medical-knowledge.json';

interface ToolContext {
  patientId?: string;
}

export function createMediCoachTools(ctx: ToolContext) {
  return {
    consultar_medicamento: tool({
      description: 'Busca información oficial de un medicamento en openFDA: efectos adversos, contraindicaciones, dosis. Usá esto SIEMPRE que el paciente mencione un medicamento.',
      parameters: z.object({
        nombre: z.string().describe('Nombre del medicamento (ej: metformin, enalapril)'),
      }),
      execute: async ({ nombre }) => {
        try {
          const label = await fetchDrugLabel(nombre);
          if (!label) return { error: 'No se encontró información oficial', nombre };
          return {
            nombre,
            efectos_adversos: label.adverse_reactions?.[0]?.slice(0, 600) ?? 'No disponible',
            contraindicaciones: label.contraindications?.[0]?.slice(0, 400) ?? 'No disponible',
            dosis: label.dosage_and_administration?.[0]?.slice(0, 400) ?? 'No disponible',
            fuente: 'FDA Drug Label (openFDA)',
          };
        } catch (e) {
          return { error: String(e), nombre };
        }
      },
    }),

    buscar_conocimiento: tool({
      description: 'Busca en la base de conocimiento curada en español sobre medicamentos comunes para diabetes e hipertensión.',
      parameters: z.object({
        query: z.string().describe('Consulta en español, ej: "mareos por metformina"'),
      }),
      execute: async ({ query }) => {
        const q = query.toLowerCase();
        const results = (medicalKnowledge as any[]).filter(item =>
          item.content.toLowerCase().includes(q) ||
          item.drug.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q)
        ).slice(0, 4);
        return { results, fuente: 'MediCoach Knowledge Base (curado)' };
      },
    }),

    registrar_sintoma: tool({
      description: 'Registra un síntoma reportado por el paciente en su historial clínico. Usalo cuando el paciente describa cómo se siente.',
      parameters: z.object({
        sintoma: z.string().describe('Nombre del síntoma normalizado, ej: "mareos", "cefalea", "náuseas"'),
        severidad: z.number().min(1).max(10).describe('Severidad 1-10'),
        contexto: z.string().optional().describe('Contexto: ej "después de tomar metformina"'),
      }),
      execute: async ({ sintoma, severidad, contexto }) => {
        if (!ctx.patientId) return { error: 'Usuario no autenticado' };
        const admin = createAdminClient();
        const { data, error } = await admin.from('symptoms').insert({
          patient_id: ctx.patientId,
          symptom: sintoma.toLowerCase().trim(),
          severity: severidad,
          note: contexto ?? null,
          recorded_at: new Date().toISOString(),
        }).select().single();
        if (error) return { error: error.message };
        return { ok: true, id: data.id, mensaje: `Registré "${sintoma}" con severidad ${severidad}/10` };
      },
    }),

    obtener_historial: tool({
      description: 'Obtiene los síntomas y medicación tomados por el paciente en los últimos N días.',
      parameters: z.object({
        dias: z.number().min(1).max(30).default(7),
      }),
      execute: async ({ dias }) => {
        if (!ctx.patientId) return { error: 'Usuario no autenticado' };
        const admin = createAdminClient();
        const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
        const [symptoms, medications] = await Promise.all([
          admin.from('symptoms').select('*').eq('patient_id', ctx.patientId).gte('recorded_at', desde).order('recorded_at', { ascending: false }),
          admin.from('medications').select('*').eq('patient_id', ctx.patientId).eq('active', true),
        ]);
        return { sintomas: symptoms.data ?? [], medicaciones: medications.data ?? [], dias };
      },
    }),

    generar_url_reporte: tool({
      description: 'Genera el link al reporte PDF que el paciente puede descargar para llevar a su médico. Usalo cuando el paciente pida un resumen o reporte.',
      parameters: z.object({}),
      execute: async () => {
        return { url: '/report', mensaje: 'Reporte listo para descargar' };
      },
    }),
  };
}
```

---

## FASE 4 — Crear el knowledge base estático

Creá `data/medical-knowledge.json` con un array de entradas. Acá te paso el esqueleto completo con ~30 entradas para los 10 medicamentos más comunes en diabetes + HTA. Generá el contenido en español, claro, fuentes mencionadas:

```json
[
  {
    "id": "metformina-efectos-comunes",
    "drug": "Metformina",
    "topic": "efectos adversos comunes",
    "content": "La metformina puede causar náuseas, diarrea, dolor abdominal, sabor metálico y mareos leves, especialmente al inicio del tratamiento. Estos efectos suelen disminuir con el tiempo. Tomarla con las comidas reduce las molestias gastrointestinales.",
    "source": "MedlinePlus / FDA"
  },
  {
    "id": "metformina-mareos",
    "drug": "Metformina",
    "topic": "mareos",
    "content": "Los mareos leves después de tomar metformina son comunes y suelen estar relacionados con el descenso de la glucosa. Si los mareos son intensos, persisten más de unos minutos, o vienen acompañados de sudoración fría o confusión, podría ser hipoglucemia y se debe consultar al médico.",
    "source": "MedlinePlus"
  },
  {
    "id": "metformina-cuando-consultar",
    "drug": "Metformina",
    "topic": "cuándo consultar al médico",
    "content": "Consultar urgente si aparece debilidad muscular intensa, dificultad para respirar, dolor abdominal severo, latidos cardíacos lentos o irregulares — pueden ser signos de acidosis láctica, una complicación rara pero grave.",
    "source": "FDA Drug Label"
  },
  {
    "id": "enalapril-efectos-comunes",
    "drug": "Enalapril",
    "topic": "efectos adversos comunes",
    "content": "Los efectos más comunes del enalapril son tos seca persistente, mareos al levantarse (hipotensión postural), dolor de cabeza y fatiga. La tos puede aparecer semanas después de iniciar el tratamiento.",
    "source": "MedlinePlus"
  },
  {
    "id": "enalapril-tos",
    "drug": "Enalapril",
    "topic": "tos seca",
    "content": "La tos seca es un efecto adverso conocido de los IECA como el enalapril. Si es muy molesta, comentar con el médico — existen alternativas como los ARA II (losartán, valsartán) que no producen tos.",
    "source": "MedlinePlus"
  },
  {
    "id": "enalapril-emergencia",
    "drug": "Enalapril",
    "topic": "emergencia",
    "content": "Buscar atención médica de inmediato si aparece hinchazón de labios, lengua o garganta, dificultad para respirar o tragar — puede ser angioedema, una reacción alérgica grave que requiere atención inmediata.",
    "source": "FDA"
  },
  {
    "id": "losartan-efectos-comunes",
    "drug": "Losartán",
    "topic": "efectos adversos comunes",
    "content": "Los efectos más frecuentes son mareos, fatiga, congestión nasal y dolor de espalda. A diferencia del enalapril, el losartán raramente causa tos.",
    "source": "MedlinePlus"
  },
  {
    "id": "atorvastatina-efectos-comunes",
    "drug": "Atorvastatina",
    "topic": "efectos adversos comunes",
    "content": "La atorvastatina puede causar dolor muscular leve, dolor de cabeza, náuseas y trastornos del sueño. La mayoría de las personas la tolera bien.",
    "source": "MedlinePlus"
  },
  {
    "id": "atorvastatina-dolor-muscular",
    "drug": "Atorvastatina",
    "topic": "dolor muscular",
    "content": "El dolor muscular leve es común con las estatinas. Si el dolor es intenso, los músculos se sienten débiles, o aparece orina oscura, consultar al médico de inmediato — puede ser rabdomiólisis, complicación rara pero grave.",
    "source": "FDA"
  },
  {
    "id": "glibenclamida-efectos-comunes",
    "drug": "Glibenclamida",
    "topic": "efectos adversos comunes",
    "content": "El efecto adverso más importante de la glibenclamida es la hipoglucemia (bajada de azúcar). Síntomas: temblor, sudoración fría, mareos, hambre intensa, confusión. Tener siempre azúcar o caramelos a mano.",
    "source": "MedlinePlus"
  },
  {
    "id": "hidroclorotiazida-efectos",
    "drug": "Hidroclorotiazida",
    "topic": "efectos adversos comunes",
    "content": "La hidroclorotiazida es un diurético que puede causar aumento de la frecuencia urinaria, mareos al levantarse, calambres musculares y debilidad. Puede afectar los niveles de potasio en sangre.",
    "source": "MedlinePlus"
  },
  {
    "id": "amlodipino-efectos",
    "drug": "Amlodipino",
    "topic": "efectos adversos comunes",
    "content": "El amlodipino frecuentemente causa hinchazón de tobillos y pies (edema), enrojecimiento facial, dolor de cabeza y palpitaciones. La hinchazón suele ser más notoria al final del día.",
    "source": "MedlinePlus"
  },
  {
    "id": "simvastatina-efectos",
    "drug": "Simvastatina",
    "topic": "efectos adversos comunes",
    "content": "Similar a la atorvastatina: dolor muscular, dolor de cabeza, problemas digestivos. Se recomienda tomarla por la noche.",
    "source": "MedlinePlus"
  },
  {
    "id": "aspirina-baja-efectos",
    "drug": "Aspirina",
    "topic": "efectos adversos comunes",
    "content": "La aspirina en dosis bajas (cardioprotectora) puede causar irritación gástrica, acidez y aumentar el riesgo de sangrado. Consultar antes de procedimientos dentales o cirugías.",
    "source": "MedlinePlus"
  },
  {
    "id": "omeprazol-efectos",
    "drug": "Omeprazol",
    "topic": "efectos adversos comunes",
    "content": "El omeprazol puede causar dolor de cabeza, diarrea, dolor abdominal y náuseas. El uso prolongado puede afectar la absorción de vitamina B12 y magnesio.",
    "source": "MedlinePlus"
  },
  {
    "id": "interaccion-metformina-alcohol",
    "drug": "Metformina",
    "topic": "interacciones",
    "content": "Evitar el consumo excesivo de alcohol con metformina — aumenta el riesgo de acidosis láctica. El consumo moderado ocasional con comida suele ser tolerado.",
    "source": "MedlinePlus"
  },
  {
    "id": "interaccion-enalapril-potasio",
    "drug": "Enalapril",
    "topic": "interacciones",
    "content": "Enalapril puede aumentar los niveles de potasio. Evitar suplementos de potasio o sustitutos de la sal que lo contengan, salvo indicación médica.",
    "source": "MedlinePlus"
  },
  {
    "id": "diabetes-control-glucemia",
    "drug": "general",
    "topic": "diabetes — control",
    "content": "Para personas con diabetes tipo 2, el control adecuado incluye: medir glucemia según indicación médica, mantener actividad física regular, alimentación balanceada baja en azúcares simples, y adherencia estricta a la medicación.",
    "source": "MedlinePlus"
  },
  {
    "id": "hipertension-control",
    "drug": "general",
    "topic": "hipertensión — control",
    "content": "Para hipertensión: medir presión arterial regularmente, reducir consumo de sal, mantener peso saludable, hacer ejercicio aeróbico regular, limitar alcohol, no fumar, y tomar la medicación todos los días aunque uno se sienta bien.",
    "source": "MedlinePlus"
  },
  {
    "id": "emergencia-cardiaca",
    "drug": "general",
    "topic": "emergencia",
    "content": "Llamar a emergencias (105 en Uruguay, 911 en otros países) inmediatamente ante: dolor de pecho intenso o opresivo, dificultad respiratoria severa, debilidad o adormecimiento de un lado del cuerpo, dificultad para hablar, pérdida de conciencia, o convulsiones.",
    "source": "MedlinePlus"
  }
]
```

Agregá unas 10 entradas más siguiendo el mismo formato para tener 30+ totales — pueden ser interacciones medicamentosas, recomendaciones de estilo de vida, signos de alarma de hipoglucemia, etc.

---

## FASE 5 — System prompt nuevo

Reemplazá `lib/medicoach/agent/prompts.ts` con:

```ts
export const MEDICOACH_SYSTEM_PROMPT = `Sos MediCoach, un asistente conversacional empático y responsable para pacientes con enfermedades crónicas (diabetes tipo 2 e hipertensión arterial) en Uruguay y LATAM.

TONO Y ESTILO:
- Hablás en español rioplatense: usás "vos", "tomás", "sentís" (no "tú", "tomas", "sientes")
- Empático, claro, sin jerga médica innecesaria
- Tratás al paciente como adulto capaz de entender su salud
- Respuestas breves: 2-4 oraciones salvo que pidan explicación detallada

LO QUE PODÉS HACER:
- Registrar síntomas que el paciente reporte (siempre usá la tool registrar_sintoma)
- Consultar información oficial de medicamentos vía openFDA (siempre usá consultar_medicamento cuando se mencione un fármaco)
- Buscar en la base de conocimiento curada (buscar_conocimiento) para preguntas generales
- Obtener el historial reciente del paciente (obtener_historial)
- Generar el link al reporte PDF (generar_url_reporte) cuando pidan un resumen para el médico
- Mencionar patrones detectados de forma natural (vienen inyectados como contexto si existen)

REGLAS ABSOLUTAS — NUNCA VIOLAR:
1. NUNCA diagnostiques enfermedades ni condiciones médicas
2. NUNCA recomiendes cambiar dosis, suspender o agregar medicación
3. SIEMPRE citá la fuente cuando des información médica (FDA, MedlinePlus)
4. SIEMPRE terminá recordando consultar al médico ante cualquier cambio en el tratamiento

EMERGENCIAS — derivá inmediatamente al 105 (Uruguay) o servicio local de emergencias:
- Dolor de pecho intenso o opresivo
- Dificultad respiratoria severa
- Pérdida de conciencia o confusión severa
- Debilidad o adormecimiento de un lado del cuerpo
- Dificultad para hablar
- Hinchazón de garganta o labios (posible angioedema)
- Convulsiones

Ante CUALQUIERA de estos síntomas, NO uses tools, NO registres nada, decí directamente: "Esto puede ser una emergencia. Llamá YA al 105 o vayan a urgencias. No esperes."

FLUJO TÍPICO cuando el paciente reporta un síntoma:
1. Empatizás brevemente
2. Llamás a registrar_sintoma
3. Si menciona un medicamento, llamás a consultar_medicamento
4. Respondés con la info verificada, citando la fuente
5. Si hay un patrón ya detectado, lo mencionás
6. Cerrás recordando consultar al médico si el síntoma persiste

NUNCA inventes datos médicos. Si no tenés info en las tools, decí que no podés confirmar y sugerí consultar al médico.`;
```

---

## FASE 6 — Detección de patrones

Creá `lib/medicoach/patterns.ts`:

```ts
import { createAdminClient } from '@/lib/integrations/supabase/admin';

export interface PatternAlert {
  sintoma: string;
  count: number;
  severidadPromedio: number;
  primeraOcurrencia: string;
}

export async function detectPatterns(patientId: string, dias = 5, minCount = 3): Promise<PatternAlert[]> {
  const admin = createAdminClient();
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('symptoms')
    .select('symptom, severity, recorded_at')
    .eq('patient_id', patientId)
    .gte('recorded_at', desde);

  if (error || !data) return [];

  const groups = new Map<string, { count: number; severitySum: number; first: string }>();
  for (const row of data) {
    const key = row.symptom.toLowerCase().trim();
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.severitySum += row.severity;
      if (row.recorded_at < existing.first) existing.first = row.recorded_at;
    } else {
      groups.set(key, { count: 1, severitySum: row.severity, first: row.recorded_at });
    }
  }

  const alerts: PatternAlert[] = [];
  for (const [sintoma, g] of groups.entries()) {
    if (g.count >= minCount) {
      alerts.push({
        sintoma,
        count: g.count,
        severidadPromedio: g.severitySum / g.count,
        primeraOcurrencia: g.first,
      });
    }
  }
  return alerts;
}
```

---

## FASE 7 — MCP Server propio

Creá `app/api/mcp/route.ts` que exponga 2 tools del MediCoach como MCP server. Usá la spec de Model Context Protocol siguiendo el patrón de Vercel para deploy de MCP servers.

Si tenés disponible el SDK `@modelcontextprotocol/sdk`, usalo. Si no, instalalo: `npm i @modelcontextprotocol/sdk`.

Tools que el MCP server debe exponer:

1. `consultar_medicamento(nombre: string)` — reusa `lib/medicoach/fda/client.ts`
2. `buscar_conocimiento(query: string)` — busca en `data/medical-knowledge.json`

Implementá el endpoint POST que maneje el protocolo MCP (initialize, tools/list, tools/call). Documentalo brevemente en un comentario al inicio del archivo explicando cómo conectarse desde Claude Desktop u otro cliente MCP.

Ejemplo mínimo de estructura (adaptá según el SDK que esté disponible):

```ts
// MCP Server endpoint para MediCoach
// Conexión: agregar a la config de Claude Desktop:
// {
//   "mcpServers": {
//     "medicoach": { "url": "https://medicoach.vercel.app/api/mcp" }
//   }
// }

import { fetchDrugLabel } from '@/lib/medicoach/fda/client';
import medicalKnowledge from '@/data/medical-knowledge.json';

const TOOLS = [
  {
    name: 'consultar_medicamento',
    description: 'Información oficial de un medicamento desde openFDA',
    inputSchema: {
      type: 'object',
      properties: { nombre: { type: 'string' } },
      required: ['nombre'],
    },
  },
  {
    name: 'buscar_conocimiento',
    description: 'Busca en la base curada de conocimiento médico para diabetes/HTA',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
];

export async function POST(req: Request) {
  const body = await req.json();
  const { method, params, id } = body;

  if (method === 'initialize') {
    return Response.json({
      jsonrpc: '2.0',
      id,
      result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'medicoach', version: '0.1.0' } },
    });
  }

  if (method === 'tools/list') {
    return Response.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    let result;
    if (name === 'consultar_medicamento') {
      result = await fetchDrugLabel(args.nombre);
    } else if (name === 'buscar_conocimiento') {
      const q = args.query.toLowerCase();
      result = (medicalKnowledge as any[]).filter(item =>
        item.content.toLowerCase().includes(q) || item.drug.toLowerCase().includes(q)
      ).slice(0, 4);
    }
    return Response.json({
      jsonrpc: '2.0',
      id,
      result: { content: [{ type: 'text', text: JSON.stringify(result) }] },
    });
  }

  return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
}

export async function GET() {
  return Response.json({ name: 'MediCoach MCP Server', tools: TOOLS.map(t => t.name) });
}
```

---

## FASE 8 — Dashboard real

Reemplazá `app/dashboard/page.tsx` por un Server Component que lee de Supabase y muestra:

- Card "Medicación de hoy" con la lista de `medications` activas del paciente
- Card "Síntomas de la semana" con un grid o gráfica simple de los `symptoms` últimos 7 días
- Card "Alertas" con el resultado de `detectPatterns(patientId)` — destacar visualmente si hay alguno
- Botón prominente "Generar reporte para mi médico" que linkea a `/report`

Usá los componentes shadcn ya disponibles (Card, Badge, Button). Si necesitás gráfica, podés instalar `recharts` o hacer un grid de barras CSS simple.

---

## FASE 9 — Reporte PDF

Instalá `@react-pdf/renderer`:

```
npm i @react-pdf/renderer
```

Creá `components/features/report/pdf-doc.tsx` con un componente `<MediCoachReport>` que reciba `{ patient, symptoms, medications, alerts }` y arme un PDF con:

- Header con nombre del paciente y fecha
- Sección "Resumen ejecutivo": adherencia % por medicamento, días con síntomas, alertas activas
- Sección "Cronología de síntomas": tabla con fecha, síntoma, severidad, contexto
- Sección "Adherencia detallada": por medicamento, dosis tomadas vs programadas
- Footer con disclaimer: "Documento generado por MediCoach. No reemplaza juicio médico profesional. Para consulta exclusiva con médico tratante."

Reemplazá `app/report/page.tsx` por un Server Component que:

1. Lee los datos del paciente, síntomas (últimos 30 días) y medicaciones
2. Llama a `detectPatterns`
3. Renderiza una preview en pantalla
4. Muestra un botón "Descargar PDF" usando `<PDFDownloadLink>` de `@react-pdf/renderer`

---

## FASE 10 — Seed data de María

Creá `scripts/seed-demo.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  // Buscar o crear paciente María (asumiendo que ya existe un usuario auth)
  const MARIA_USER_ID = process.env.DEMO_USER_ID; // pasarlo como env var
  if (!MARIA_USER_ID) throw new Error('DEMO_USER_ID required');

  // Profile
  await supabase.from('patient_profiles').upsert({
    id: MARIA_USER_ID,
    display_name: 'María González',
    conditions: ['diabetes_tipo_2', 'hipertension'],
  });

  // Medicaciones
  await supabase.from('medications').delete().eq('patient_id', MARIA_USER_ID);
  await supabase.from('medications').insert([
    { patient_id: MARIA_USER_ID, name: 'Metformina', dose: '850mg', frequency: '2 veces por día', schedule: { times: ['08:00', '20:00'] }, active: true },
    { patient_id: MARIA_USER_ID, name: 'Enalapril', dose: '10mg', frequency: '1 vez por día', schedule: { times: ['09:00'] }, active: true },
  ]);

  // Síntomas: 7 días de historial, con 3 mareos para disparar el patrón
  await supabase.from('symptoms').delete().eq('patient_id', MARIA_USER_ID);
  const ahora = Date.now();
  const dia = 24 * 60 * 60 * 1000;

  const sintomas = [
    // 3 mareos en últimos 4 días — esto dispara la alerta
    { symptom: 'mareos', severity: 4, note: 'después de tomar metformina del desayuno', daysAgo: 1 },
    { symptom: 'mareos', severity: 5, note: 'después del almuerzo', daysAgo: 2 },
    { symptom: 'mareos', severity: 4, note: 'a la mañana después de la pastilla', daysAgo: 4 },
    // Otros síntomas variados
    { symptom: 'cansancio', severity: 3, note: 'durante la tarde', daysAgo: 1 },
    { symptom: 'sed', severity: 5, note: '', daysAgo: 3 },
    { symptom: 'cefalea', severity: 6, note: 'leve dolor frontal', daysAgo: 5 },
    { symptom: 'visión borrosa', severity: 3, note: 'episodio breve', daysAgo: 6 },
    { symptom: 'cansancio', severity: 4, note: '', daysAgo: 6 },
  ];

  await supabase.from('symptoms').insert(
    sintomas.map(s => ({
      patient_id: MARIA_USER_ID,
      symptom: s.symptom,
      severity: s.severity,
      note: s.note,
      recorded_at: new Date(ahora - s.daysAgo * dia).toISOString(),
    }))
  );

  console.log('Seed completo para María');
}

seed().catch(console.error);
```

Ejecutar con: `DEMO_USER_ID=<uuid> npx tsx scripts/seed-demo.ts`

---

## FASE 11 — Verificación final

Después de todo el refactor, verificá:

1. `npm run build` compila sin errores
2. `npm run dev` levanta el server
3. Login con magic link funciona
4. Mensaje "tomé metformina y me dieron mareos" → agente registra el síntoma + consulta openFDA + cita la fuente
5. `/dashboard` muestra cards con datos seed
6. `/report` muestra preview y permite descargar PDF
7. `GET /api/mcp` responde con la lista de tools del MCP server
8. Si la sesión es de María (con seed data), se dispara la alerta de patrón en la siguiente conversación

---

## Recordatorios

- Si algo del repo viejo da error y NO está en la lista de FASE 1, **bypaseálo**, no lo debuguees (estamos contra reloj)
- Si una migración SQL nueva es necesaria por algo que se cambió, evitala — adaptá el código al schema existente
- Si una tool requiere data del paciente que no tenemos, devolvé un error amable y seguí

Después de cada fase, decime qué encontraste y qué cambiaste para revisar antes de continuar.