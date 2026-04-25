import { z } from "zod";

/** Body enviado por `useChat` / Bruno hacia `POST /api/chat`. */
export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()),
  sessionId: z.string().uuid().optional(),
  /** Alinea system prompt, tools y búsqueda de conocimiento con el idioma de la UI. */
  locale: z.enum(["es", "en"]).default("es"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
