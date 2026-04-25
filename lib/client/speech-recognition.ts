/** API de dictado del navegador (Chrome/Edge; sin costo ni API keys). */

export type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: BrowserSpeechRecognition) => void) | null;
};

export type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

export type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

export function getSpeechRecognitionCtor():
  | (new () => BrowserSpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function speechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

/** Mensaje legible para `SpeechRecognitionErrorEvent.error` (códigos del estándar). */
export function speechRecognitionErrorMessage(
  code: string,
  fallbackMessage?: string,
): string {
  switch (code) {
    case "network":
      return (
        "No se pudo conectar al servicio de reconocimiento del navegador " +
        "(Chrome/Edge suelen usar internet). Revisá conexión, VPN, firewall o " +
        "extensiones que bloqueen Google; probá otra red o ventana de incógnito."
      );
    case "not-allowed":
      return "Permiso de micrófono denegado. Permití el acceso al micrófono para este sitio.";
    case "audio-capture":
      return "No se detecta micrófono o está en uso por otra app.";
    case "service-not-allowed":
      return "El reconocimiento de voz está deshabilitado en el navegador o por políticas del dispositivo.";
    case "language-not-supported":
      return "Este idioma no está disponible para dictado en tu navegador.";
    case "aborted":
    case "no-speech":
      return "";
    default:
      return fallbackMessage || code || "Error de dictado";
  }
}
