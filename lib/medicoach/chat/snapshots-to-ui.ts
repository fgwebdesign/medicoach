import type { UIMessage } from "ai";

/** Fila serializada en `chat_sessions.messages` (ver `persistChatTurn`). */
export type ChatMessageSnapshot = {
  role: string;
  content?: string;
  parts?: unknown;
};

function textFromSnapshot(m: ChatMessageSnapshot): string {
  if (typeof m.content === "string" && m.content.trim()) return m.content;
  return "";
}

/** Convierte snapshots del servidor a mensajes que entiende `useChat` (solo texto). */
export function snapshotsToUiMessages(
  raw: unknown,
  sessionPrefix: string,
): UIMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m, i) => {
    const s = m as ChatMessageSnapshot;
    const text = textFromSnapshot(s);
    const role =
      s.role === "user" || s.role === "assistant" || s.role === "system"
        ? s.role
        : "user";
    return {
      id: `${sessionPrefix}-${i}-${role}`,
      role,
      parts: [{ type: "text" as const, text }],
    } as UIMessage;
  });
}

export function lastUserPreview(messages: unknown, max = 80): string {
  if (!Array.isArray(messages)) return "Sin mensajes";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as ChatMessageSnapshot;
    if (m?.role !== "user") continue;
    const t = textFromSnapshot(m);
    if (t) return t.length > max ? `${t.slice(0, max)}…` : t;
  }
  return "Charla";
}
