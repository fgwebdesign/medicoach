import { createAdminClient } from "@/lib/integrations/supabase/admin";

export type RagRow = {
  id: number;
  content: string;
  source: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

export async function searchMedicalKnowledge(
  embedding: number[],
  options?: { threshold?: number; count?: number },
): Promise<RagRow[]> {
  const supabase = createAdminClient();
  const vectorLiteral = `[${embedding.join(",")}]`;
  const { data, error } = await supabase.rpc("search_medical_knowledge", {
    query_embedding: vectorLiteral,
    match_threshold: options?.threshold ?? 0.72,
    match_count: options?.count ?? 5,
  });
  if (error) {
    throw new Error(`search_medical_knowledge: ${error.message}`);
  }
  return (data ?? []) as RagRow[];
}
