"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, SendHorizonal } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

function messageText(m: { parts?: { type: string; text?: string }[] }) {
  return (
    m.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

export function MediChat() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
  });

  const busy = status === "streaming" || status === "submitted";

  return (
    <Card className="flex min-h-[55vh] flex-col">
      <CardHeader className="border-b py-3">
        <p className="text-sm text-muted-foreground">
          MediCoach — fuentes FDA/NIH son referencia US; ante emergencias llamá a
          servicios locales.
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <ScrollArea className="min-h-[320px] flex-1 px-4 py-3">
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm"
                    : "mr-8 rounded-lg bg-muted px-3 py-2 text-sm"
                }
              >
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  {m.role === "user" ? "Vos" : "MediCoach"}
                </span>
                <div className="whitespace-pre-wrap">{messageText(m)}</div>
              </li>
            ))}
          </ul>
        </ScrollArea>
        {error ? (
          <p className="px-4 text-sm text-destructive">{error.message}</p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const text = String(fd.get("msg") ?? "").trim();
            if (!text) return;
            void sendMessage({ text });
            e.currentTarget.reset();
          }}
        >
          <Input
            name="msg"
            placeholder="Escribí cómo te sentís o qué medicación tomaste…"
            disabled={busy}
            autoComplete="off"
            className="flex-1"
          />
          <Button type="submit" disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <SendHorizonal className="size-4" aria-hidden />
            )}
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
        {busy ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void stop()}>
            Detener
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
