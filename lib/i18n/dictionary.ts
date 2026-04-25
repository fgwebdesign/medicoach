import type { Locale } from "./types";

/** Claves y textos. Fase 1: chat, modal de términos, guía, nav del header. */
export type MessageDictionary = {
  nav: {
    dashboard: string;
    chat: string;
    report: string;
    signIn: string;
    signOut: string;
  };
  header: { guestSignIn: string };
  common: { loading: string };
  chat: {
    todayWithAssistant: string;
    newChat: string;
    newChatShort: string;
    howTodayTitle: string;
    howTodaySubtitle: string;
    ideaPrompts: string;
    inputPlaceholder: string;
    inputAria: string;
    send: string;
    stopGenerating: string;
    stopDictation: string;
    startDictation: string;
    listening: string;
    listeningHelp: string;
    micBrowserUnsupported: string;
    micInitError: string;
    suggested: readonly [string, string, string];
  };
  terms: {
    title: string;
    badge: string;
    lead: string;
    emergency: string;
    professional: string;
    fdaTitle: string;
    fdaLine: string;
    micDetail: string;
    checkbox: string;
    cta: string;
    fdaAttribution: string;
    fdaLogoAlt: string;
  };
  sidebar: {
    aria: string;
    title: string;
    intro: string;
    s1: string;
    s1b: string;
    s2: string;
    s2b: string;
    s3: string;
    s3b: string;
    foot: string;
  };
};

const en: MessageDictionary = {
  nav: {
    dashboard: "Dashboard",
    chat: "Chat",
    report: "Report",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  header: { guestSignIn: "Sign in" },
  common: { loading: "Loading…" },
  chat: {
    todayWithAssistant: "With the assistant today",
    newChat: "New chat",
    newChatShort: "New",
    howTodayTitle: "How are you feeling today?",
    howTodaySubtitle:
      "Type or pick a starter. We can help you build a useful summary for your visit.",
    ideaPrompts: "Ideas to get started",
    inputPlaceholder: "Type or dictate how you feel…",
    inputAria: "Message to MediCoach",
    send: "Send",
    stopGenerating: "Stop generating",
    stopDictation: "Stop voice input",
    startDictation: "Voice input",
    listening: "Listening: ",
    listeningHelp: "Talk, then tap the mic again to finish.",
    micBrowserUnsupported:
      "Your browser does not support voice input. Try Chrome or Edge.",
    micInitError: "Could not start the microphone.",
    suggested: [
      "I took metformina today and felt mild dizziness. Can that be normal?",
      "I have high blood pressure and sometimes a cough. What should I know?",
      "I want to log a mild headache since yesterday, about 4/10 in severity",
    ] as const,
  },
  terms: {
    title: "Before you start",
    badge: "General information, not a diagnosis",
    lead: "This assistant does not replace a clinician or a diagnosis. In doubt, see your care team. If you have an emergency, call your local emergency number.",
    emergency:
      "Chest pain, shortness of breath, fainting, or sudden one-sided weakness: get emergency help now.",
    professional:
      "You can use summaries in your care; your clinician makes treatment decisions.",
    fdaTitle: "Medication context",
    fdaLine: "Drug-related answers may use public U.S. FDA data (openFDA).",
    micDetail: "The microphone uses speech-to-text on your device; we do not store audio recordings.",
    checkbox:
      "I have read the above, including that this is for education only and is not a diagnosis or a substitute for professional care, and I agree to use MediCoach under those terms.",
    cta: "Continue to chat",
    fdaAttribution: "U.S. Food & Drug Administration (open data)",
    fdaLogoAlt: "U.S. Food and Drug Administration seal",
  },
  sidebar: {
    aria: "How to use the chat",
    title: "Your chat space",
    intro:
      "Talk naturally: how you feel, your medicines, or questions. This assistant is designed for diabetes and high blood pressure support.",
    s1: "Symptoms and wellness",
    s1b: "Describe symptoms or changes, at your own pace.",
    s2: "Medication",
    s2b: "Doses and names you were given; the assistant is educational and does not replace your doctor.",
    s3: "Summary for the doctor",
    s3b: "Ask for a visit summary when you need it.",
    foot: "The chat is saved securely to your account for useful history. This does not replace a clinician. In an emergency, call emergency services.",
  },
};

const es: MessageDictionary = {
  nav: {
    dashboard: "Panel",
    chat: "Chat",
    report: "Reporte",
    signIn: "Entrar",
    signOut: "Salir",
  },
  header: { guestSignIn: "Entrar" },
  common: { loading: "Cargando…" },
  chat: {
    todayWithAssistant: "Hoy con el asistente",
    newChat: "Nueva charla",
    newChatShort: "Nueva",
    howTodayTitle: "¿Cómo te sentís hoy?",
    howTodaySubtitle:
      "Escribí o elegí un ejemplo. Lo que anotemos puede ayudarte a armar un resumen para el médico.",
    ideaPrompts: "Ideas para empezar",
    inputPlaceholder: "Escribí o dictá cómo te sentís…",
    inputAria: "Mensaje para MediCoach",
    send: "Enviar",
    stopGenerating: "Dejar de generar",
    stopDictation: "Detener dictado",
    startDictation: "Dictar por voz",
    listening: "Escuchando: ",
    listeningHelp: "Hablá y tocá el micrófono otra vez para terminar.",
    micBrowserUnsupported:
      "Tu navegador no soporta dictado por voz. Probá Chrome o Edge.",
    micInitError: "No se pudo iniciar el micrófono.",
    suggested: [
      "Hoy tomé metformina y tuve mareos leves, ¿puede ser normal?",
      "Tengo presión alta y a veces tos, ¿a qué puede deberse?",
      "Quiero anotar cefalea leve desde ayer, severidad 4",
    ] as const,
  },
  terms: {
    title: "Antes de empezar",
    badge: "Información general, no diagnóstico",
    lead: "Este asistente no reemplaza al médico ni a un diagnóstico. Ante la duda, consultá a tu equipo de salud. En emergencia, llamá a emergencias.",
    emergency:
      "Dolor de pecho, ahogo, desmayo o debilidad repentina de un lado: pedí atención de urgencia ya.",
    professional:
      "Podés generar resúmenes para la visita: la decisión de tratamiento la hace tu equipo clínico.",
    fdaTitle: "Sobre la medicación",
    fdaLine: "Sobre fármacos, el asistente complementa con datos públicos (EE. UU., openFDA / FDA).",
    micDetail:
      "El micrófono pasa voz a texto en tu aparato; no guardamos grabaciones de voz.",
    checkbox:
      "Leí lo anterior, incluido que esto es educativo y no constituye diagnóstico ni reemplaza la atención profesional, y acepto usar MediCoach bajo esas condiciones.",
    cta: "Entrar al chat",
    fdaAttribution: "U.S. Food and Drug Administration (datos abiertos)",
    fdaLogoAlt: "Sello de la Administración de Alimentos y Medicamentos de EE. UU. (FDA)",
  },
  sidebar: {
    aria: "Guía de uso del chat",
    title: "Tu espacio de conversación",
    intro:
      "Hablá con naturalidad: contá cómo te sentís, qué pastillas tomás o qué dudas tenés. El asistente está pensado para diabetes e hipertensión.",
    s1: "Síntomas y bienestar",
    s1b: "Describí mareos, cansancio o cambios, sin apuro.",
    s2: "Medicación",
    s2b: "Contá dosis o nombres tal como te dijeron; el asistente responde con guías, no reemplaza al médico.",
    s3: "Resumen para el médico",
    s3b: "Pedí un resumen cuando vayas a la consulta.",
    foot: "La conversación queda vinculada a tu cuenta de forma segura, para que podamos armar un historial útil. Esto no reemplaza al médico; ante emergencia llamá a emergencias.",
  },
};

export const dictionaries: Record<Locale, MessageDictionary> = { en, es };

export function getDictionary(locale: Locale): MessageDictionary {
  return dictionaries[locale] ?? dictionaries.es;
}
