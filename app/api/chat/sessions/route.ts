import { lastUserPreview } from "@/lib/medicoach/chat/snapshots-to-ui";
import { createClient } from "@/lib/integrations/supabase/server";

export const maxDuration = 30;

export type SessionListItem = {
  id: string;
  updated_at: string;
  preview: string;
};

/** Listado de charlas recientes (RLS: solo del usuario). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, updated_at, messages")
    .eq("patient_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(40);
  if (error) {
    console.error("[chat/sessions] list", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  const items: SessionListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    updated_at: row.updated_at,
    preview: lastUserPreview(row.messages),
  }));
  return Response.json({ sessions: items });
}

/** Crea una charla vacía; los mensajes se van guardando vía `POST /api/chat` con `sessionId`. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      patient_id: user.id,
      messages: [],
    })
    .select("id")
    .single();
  if (error) {
    console.error("[chat/sessions] post", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ id: data.id as string });
}
