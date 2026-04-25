"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  Loader2,
  Mic,
  MicOff,
  Plus,
  SendHorizonal,
  Stethoscope,
  User,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { ChatTermsModal } from "@/components/features/chat/chat-terms-modal";
import { getChatTermsAccepted } from "@/lib/chat/terms-storage";
import {
  getSpeechRecognitionCtor,
  speechRecognitionErrorMessage,
  speechRecognitionSupported,
  type BrowserSpeechRecognition,
  type SpeechRecognitionResultEvent,
} from "@/lib/client/speech-recognition";
import type { Locale } from "@/lib/i18n/types";

function messageText(m: { parts?: { type: string; text?: string }[] }) {
  return (
    m.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

const MessageBubble = memo(function MessageBubble({
  message: m,
}: {
  message: UIMessage;
}) {
  const text = messageText(m);
  const isUser = m.role === "user";

  return (
    <li
      className={cn(
        "group flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 select-none items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground shadow-sm"
            : "border border-border/50 bg-gradient-to-br from-primary/8 to-muted/80 text-primary shadow-sm",
        )}
        title={isUser ? "Vos" : "MediCoach"}
        aria-label={isUser ? "Your message" : "Assistant message"}
      >
        {isUser ? (
          <User className="size-4" strokeWidth={2.25} aria-hidden />
        ) : (
          <Stethoscope className="size-4" strokeWidth={2} aria-hidden />
        )}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[min(100%,30rem)] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/50 bg-card text-foreground",
        )}
      >
        <div className="whitespace-pre-wrap break-words">{text}</div>
      </div>
    </li>
  );
});

function recLangForLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-UY";
}

function MediChatBody() {
  const { t, messages: dict, locale } = useLocale();
  const SUGGESTED = dict.chat.suggested;
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    error,
    clearError,
  } = useChat({
    transport,
    experimental_throttle: 48,
  });

  const busy = status === "streaming" || status === "submitted";
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recRef = useRef<BrowserSpeechRecognition | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const canDictate = clientReady && speechRecognitionSupported();
  const endRef = useRef<HTMLDivElement>(null);

  const startNewConversation = useCallback(() => {
    if (busy) void stop();
    setMessages(() => []);
    setInput("");
    setVoiceError(null);
    clearError();
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, [busy, clearError, setMessages, stop]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, status]);

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
      setVoiceError(t("chat.micBrowserUnsupported"));
      return;
    }
    if (busy) return;

    const lang = recLangForLocale(locale);

    try {
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: SpeechRecognitionResultEvent) => {
        let piece = "";
        let interimPiece = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const row = event.results.item(i);
          if (!row?.[0]) continue;
          const t0 = row[0].transcript;
          if (row.isFinal) piece += t0;
          else interimPiece += t0;
        }
        if (piece) {
          setInput((prev) => {
            const join =
              prev && !/\s$/.test(prev) ? `${prev} ${piece}` : `${prev}${piece}`;
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
      setVoiceError(t("chat.micInitError"));
      setListening(false);
    }
  }, [busy, stopListening, locale, t]);

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
    <div className="flex min-h-[min(72dvh,760px)] flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-background via-primary/[0.04] to-background px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="hidden h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20 sm:block"
            aria-hidden
          />
          <p className="font-heading truncate text-sm font-semibold text-foreground sm:text-base">
            {t("chat.todayWithAssistant")}
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full px-3.5 text-xs sm:text-sm"
          onClick={startNewConversation}
        >
          <Plus className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{t("chat.newChat")}</span>
          <span className="sm:hidden">{t("chat.newChatShort")}</span>
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-[300px] flex-1 px-3 py-3 sm:min-h-[380px] sm:px-5 sm:py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-2 text-center sm:py-4">
              <p className="font-heading text-lg font-semibold text-foreground sm:text-xl">
                {t("chat.howTodayTitle")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("chat.howTodaySubtitle")}
              </p>
              <div className="w-full space-y-2.5 text-left">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("chat.ideaPrompts")}
                </p>
                <ul className="flex flex-col gap-2 sm:gap-2.5">
                  {SUGGESTED.map((text) => (
                    <li key={text}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-auto w-full justify-start rounded-xl border border-border/50 bg-background/90 py-2.5 text-left text-sm font-normal leading-snug text-foreground shadow-none transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-sm"
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

          {messages.length > 0 ? (
            <ul className="mx-auto flex max-w-2xl flex-col gap-5 pb-2 sm:px-0">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </ul>
          ) : null}
          <div ref={endRef} className="h-px" aria-hidden />
        </ScrollArea>

        {error ? (
          <p className="px-3 pb-1 text-sm text-destructive sm:px-4">
            {error.message}
          </p>
        ) : null}
        {voiceError ? (
          <p className="px-3 pb-1 text-sm text-destructive sm:px-4">
            {voiceError}
          </p>
        ) : null}
      </div>

      <div className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20 p-3 sm:p-4">
        <form
          className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
            void sendMessage({ text });
            setInput("");
          }}
        >
          <div className="flex w-full min-w-0 flex-1 gap-2">
            <Input
              name="msg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.inputPlaceholder")}
              disabled={busy || listening}
              autoComplete="off"
              className="h-12 flex-1 rounded-xl border-border/60 bg-background/80"
              aria-label={t("chat.inputAria")}
            />
            <Button
              type="button"
              variant={listening ? "secondary" : "outline"}
              size="icon"
              className="h-12 w-12 shrink-0 rounded-xl"
              disabled={busy || !canDictate}
              onClick={() => (listening ? stopListening() : startListening())}
              aria-pressed={listening}
              aria-label={
                listening ? t("chat.stopDictation") : t("chat.startDictation")
              }
            >
              {listening ? (
                <MicOff className="size-4 text-destructive" aria-hidden />
              ) : (
                <Mic className="size-4" aria-hidden />
              )}
            </Button>
            <Button
              type="submit"
              className="h-12 w-12 shrink-0 rounded-xl"
              size="icon"
              disabled={busy || listening || !input.trim()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <SendHorizonal className="size-4" aria-hidden />
              )}
              <span className="sr-only">{t("chat.send")}</span>
            </Button>
          </div>
          {listening && interim ? (
            <p className="text-xs text-muted-foreground sm:order-last sm:w-full">
              {t("chat.listening")}
              {interim}
            </p>
          ) : listening ? (
            <p className="text-xs text-muted-foreground sm:order-last sm:w-full">
              {t("chat.listeningHelp")}
            </p>
          ) : null}
        </form>
        {busy ? (
          <div className="mx-auto mt-2 flex max-w-2xl justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void stop()}
            >
              {t("chat.stopGenerating")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MediChatLoadingShell() {
  const { t } = useLocale();
  return (
    <div
      className="flex min-h-[min(72dvh,760px)] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-card px-4 py-12 text-sm text-muted-foreground shadow-md ring-1 ring-black/5 dark:ring-white/10"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="mb-3 size-8 animate-spin text-primary"
        aria-hidden
      />
      {t("common.loading")}
    </div>
  );
}

export function MediChat() {
  const [terms, setTerms] = useState<boolean | null>(null);

  useEffect(() => {
    setTerms(getChatTermsAccepted());
  }, []);

  if (terms === null) {
    return <MediChatLoadingShell />;
  }

  return (
    <>
      <ChatTermsModal
        open={!terms}
        onAccepted={() => setTerms(true)}
      />
      <div
        className={cn(
          "transition-opacity duration-200",
          !terms && "pointer-events-none select-none opacity-35",
        )}
        inert={!terms}
        aria-hidden={!terms}
      >
        <MediChatBody />
      </div>
    </>
  );
}
