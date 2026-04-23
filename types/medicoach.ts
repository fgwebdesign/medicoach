/** Tipos compartidos del dominio MediCoach (API, agente, DB). */

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id?: string;
  role: ChatRole;
  content: string;
};
