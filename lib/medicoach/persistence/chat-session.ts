import { createAdminClient } from "@/lib/integrations/supabase/admin";

export type ChatMessageSnapshot = {
  role: string;
  content?: string;
  parts?: unknown;
};

/**
 * Guarda el turno en `chat_sessions` (service role). Si `sessionId` existe, actualiza esa fila.
 */
export async function persistChatTurn(options: {
  patientId: string;
  sessionId?: string;
  messages: ChatMessageSnapshot[];
}) {
  const supabase = createAdminClient();
  const row = {
    messages: options.messages as unknown as object,
    updated_at: new Date().toISOString(),
  };

  if (options.sessionId) {
    const { error } = await supabase
      .from("chat_sessions")
      .update(row)
      .eq("id", options.sessionId)
      .eq("patient_id", options.patientId);
    if (error) throw error;
    return { sessionId: options.sessionId };
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      patient_id: options.patientId,
      messages: options.messages as unknown as object,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { sessionId: data.id as string };
}
