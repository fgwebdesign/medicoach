import { snapshotsToUiMessages } from "@/lib/medicoach/chat/snapshots-to-ui";
import { createClientFromRequest } from "@/lib/integrations/supabase/route-request";
import { type NextRequest } from "next/server";

export const maxDuration = 30;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  const supabase = createClientFromRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, patient_id, messages, updated_at")
    .eq("id", id)
    .eq("patient_id", user.id)
    .maybeSingle();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "No encontrada" }, { status: 404 });
  }
  return Response.json({
    id: data.id,
    updated_at: data.updated_at,
    /** Ya listos para `setMessages` (solo partes de texto; sin tool UI). */
    uiMessages: snapshotsToUiMessages(data.messages, data.id as string),
  });
}
