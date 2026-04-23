import { z } from "zod";

/** Body enviado por `useChat` / Bruno hacia `POST /api/chat`. */
export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()),
  sessionId: z.string().uuid().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
