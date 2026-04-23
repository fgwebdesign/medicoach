import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

export type MediCoachIntent = "symptoms" | "medication" | "report" | "general";

const StateAnnotation = Annotation.Root({
  lastUserText: Annotation<string>,
  intent: Annotation<MediCoachIntent>,
});

/** Clasificación barata (sin LLM) para enrutar herramientas y prompts futuros. */
export function classifyHeuristic(text: string): MediCoachIntent {
  const t = text.toLowerCase();
  if (/(reporte|pdf|resumen|médico|medico|llevar al|para el doctor)/i.test(t)) {
    return "report";
  }
  if (
    /(metformin|metformina|medicamento|medicación|medicacion|pastilla|dosis|lisinopril|atorvastat|enalapril|fda|fármaco|farmaco)/i.test(
      t,
    )
  ) {
    return "medication";
  }
  if (
    /(mareo|mareos|náusea|nausea|dolor|síntoma|sintoma|mal me siento|malestar)/i.test(
      t,
    )
  ) {
    return "symptoms";
  }
  return "general";
}

function classifierNode(state: typeof StateAnnotation.State) {
  return { intent: classifyHeuristic(state.lastUserText) };
}

const builder = new StateGraph(StateAnnotation)
  .addNode("classifier", classifierNode)
  .addEdge(START, "classifier")
  .addEdge("classifier", END);

const compiled = builder.compile();

export async function runIntentGraph(lastUserText: string) {
  return compiled.invoke({
    lastUserText,
    intent: "general",
  });
}
