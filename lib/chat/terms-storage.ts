const STORAGE = "medicoach_chat_terms_v1";

/**
 * Términos aceptados para usar el chat (cliente; persiste en localStorage).
 */
export function getChatTermsAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE) === "1";
}

export function setChatTermsAccepted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE, "1");
}
