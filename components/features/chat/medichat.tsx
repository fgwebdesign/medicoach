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

const SUGGESTED_PROMPTS = [
  "Hoy tomé metformina y tuve mareos leves, ¿puede ser normal?",
  "Tengo presión alta y a veces me da tos, ¿a qué puede deberse?",
  "Quiero registrar que tuve cefalea con severidad 4 desde ayer",
] as const;

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
    <Card className="flex min-h-[58vh] flex-col overflow-hidden border-border/60 shadow-md">
      <CardHeader className="space-y-2 border-b border-border/50 bg-muted/20 py-3 sm:py-4">
        <p className="text-sm text-muted-foreground">
          Fuentes: principalmente <strong>openFDA</strong> (etiquetas US) y
          textos de apoyo. <strong>Ante emergencia</strong> (dolor de pecho,
          falta de aire, desmayo) llamá al servicio de emergencias.
        </p>
        {canDictate ? (
          <p className="text-xs text-muted-foreground/90">
            <strong>Dictado:</strong> Chrome o Edge. El audio lo procesa el
            navegador; MediCoach no almacena grabaciones.
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <ScrollArea className="min-h-[340px] flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-2 text-center">
              <div className="max-w-md space-y-1">
                <p className="text-base font-medium text-foreground">
                  Empezá con un mensaje
                </p>
                <p className="text-sm text-muted-foreground">
                  Podés tocar un ejemplo o escribir vos: síntomas, medicación o
                  dudas generales. Si iniciaste sesión, el asistente puede
                  registrar en tu historial.
                </p>
              </div>
              <div className="flex w-full max-w-lg flex-col gap-2 sm:items-stretch">
                <p className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ideas para probar
                </p>
                <ul className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((text) => (
                    <li key={text}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-auto w-full justify-start whitespace-normal text-left text-sm font-normal"
                        onClick={() => {
                          if (busy) return;
                          void sendMessage({ text });
                        }}
                        disabled={busy}
                      >
                        {text}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-0 sm:ml-8 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm shadow-sm"
                    : "mr-0 sm:mr-8 rounded-2xl border border-border/80 bg-card px-4 py-3 text-sm shadow-sm"
                }
              >
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.role === "user" ? "Vos" : "MediCoach"}
                </span>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {messageText(m)}
                </div>
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
