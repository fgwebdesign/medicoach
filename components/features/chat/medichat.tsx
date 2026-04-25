"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Mic, MicOff, SendHorizonal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getSpeechRecognitionCtor,
  speechRecognitionErrorMessage,
  speechRecognitionSupported,
  type BrowserSpeechRecognition,
  type SpeechRecognitionResultEvent,
} from "@/lib/client/speech-recognition";

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
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recRef = useRef<BrowserSpeechRecognition | null>(null);
  /** Evita mismatch SSR/cliente: en servidor no hay `window` ni Speech API. */
  const [clientReady, setClientReady] = useState(false);
  const canDictate = clientReady && speechRecognitionSupported();

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const startListening = useCallback(() => {
    setVoiceError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceError(
        "Tu navegador no soporta dictado por voz. Probá Chrome o Edge.",
      );
      return;
    }
    if (busy) return;

    try {
      const rec = new Ctor();
      rec.lang = "es-UY";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: SpeechRecognitionResultEvent) => {
        let piece = "";
        let interimPiece = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const row = event.results.item(i);
          if (!row?.[0]) continue;
          const t = row[0].transcript;
          if (row.isFinal) piece += t;
          else interimPiece += t;
        }
        if (piece) {
          setInput((prev) => {
            const join = prev && !/\s$/.test(prev) ? `${prev} ${piece}` : `${prev}${piece}`;
            return join.trimStart();
          });
        }
        setInterim(interimPiece);
      };

      rec.onerror = (ev) => {
        if (ev.error === "aborted" || ev.error === "no-speech") return;
        const msg = speechRecognitionErrorMessage(ev.error, ev.message);
        if (msg) setVoiceError(msg);
        stopListening();
      };

      rec.onend = () => {
        setListening(false);
        setInterim("");
        recRef.current = null;
      };

      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setVoiceError("No se pudo iniciar el micrófono.");
      setListening(false);
    }
  }, [busy, stopListening]);

  useEffect(() => {
    setClientReady(true);
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <Card className="flex min-h-[55vh] flex-col">
      <CardHeader className="border-b py-3">
        <p className="text-sm text-muted-foreground">
          MediCoach — fuentes FDA/NIH son referencia US; ante emergencias llamá a
          servicios locales.
        </p>
        {canDictate ? (
          <p className="text-xs text-muted-foreground">
            Dictado con el micrófono (Chrome/Edge): el navegador puede usar su
            propio servicio en la red para transcribir; MediCoach no recibe audio
            ni grabaciones.
          </p>
        ) : null}
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
        {voiceError ? (
          <p className="px-4 text-sm text-destructive">{voiceError}</p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
        <form
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
            void sendMessage({ text });
            setInput("");
          }}
        >
          <div className="flex flex-1 gap-2">
            <Input
              name="msg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí o dictá cómo te sentís…"
              disabled={busy || listening}
              autoComplete="off"
              className="flex-1"
              aria-label="Mensaje para MediCoach"
            />
            <Button
              type="button"
              variant={listening ? "secondary" : "outline"}
              size="icon"
              disabled={busy || !canDictate}
              onClick={() => (listening ? stopListening() : startListening())}
              aria-pressed={listening}
              aria-label={listening ? "Detener dictado" : "Dictar por voz"}
              title={
                canDictate
                  ? listening
                    ? "Detener dictado"
                    : "Dictar por voz"
                  : "Dictado no disponible"
              }
            >
              {listening ? (
                <MicOff className="size-4 text-destructive" aria-hidden />
              ) : (
                <Mic className="size-4" aria-hidden />
              )}
            </Button>
            <Button type="submit" disabled={busy || listening || !input.trim()}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <SendHorizonal className="size-4" aria-hidden />
              )}
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
          {listening && interim ? (
            <p className="text-xs text-muted-foreground sm:order-last sm:basis-full">
              Escuchando: {interim}
            </p>
          ) : listening ? (
            <p className="text-xs text-muted-foreground sm:order-last sm:basis-full">
              Escuchando… hablá y tocá el micrófono otra vez para cortar.
            </p>
          ) : null}
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
