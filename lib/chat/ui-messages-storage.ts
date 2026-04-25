import type { UIMessage } from "ai";

const KEY = "medicoach_ui_messages_v1";
const MAX_MESSAGES = 80;

/**
 * Restaura el hilo de conversación al volver a /chat.
 * (El servidor persiste resúmenes en chat_sessions; esto mantiene la UI completa con parts.)
 */
export function loadChatUiMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_MESSAGES) as UIMessage[];
  } catch {
    return [];
  }
}

export function saveChatUiMessages(messages: UIMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_MESSAGES);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* lleno o privado */
  }
}

export function clearChatUiMessages(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
