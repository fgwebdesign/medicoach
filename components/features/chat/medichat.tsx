"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  FileText,
  Loader2,
  Mic,
  Plus,
  SendHorizonal,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { ChatSessionPicker } from "@/components/features/chat/chat-session-picker";
import { VoiceActivityMeter } from "@/components/features/chat/voice-activity-bars";
import { ReportPdfSheet } from "@/components/features/report/report-pdf-sheet";
import { ChatTermsModal } from "@/components/features/chat/chat-terms-modal";
import { getChatTermsAccepted } from "@/lib/chat/terms-storage";
import {
  clearChatUiMessages,
  loadChatUiMessages,
  saveChatUiMessages,
} from "@/lib/chat/ui-messages-storage";
import {
  getSpeechRecognitionCtor,
  speechRecognitionErrorMessage,
  speechRecognitionSupported,
  type BrowserSpeechRecognition,
  type SpeechRecognitionResultEvent,
} from "@/lib/client/speech-recognition";
import type { Locale } from "@/lib/i18n/types";

const emptySubscribe = () => () => {};

/** Evita mostrar JSON crudo cuando el API devuelve { error: "..." }. */
function friendlyChatApiError(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("{") && t.includes("error")) {
    try {
      const j = JSON.parse(t) as { error?: string };
      if (j.error?.includes("iniciar sesión") || j.error?.includes("sesión")) {
        return "El servidor no recibió tu sesión (cookies). Recargá la página (F5) o volvé a iniciar sesión.";
      }
      if (j.error) return j.error;
    } catch {
      /* seguir */
    }
  }
  if (t.includes("Necesitás iniciar sesión")) {
    return "Necesitás iniciar sesión o recargar la página para que el chat reciba la sesión.";
  }
  return t;
}

/** Necesitamos "solo cliente" para dictado sin setState en un effect. */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function isGenerarUrlReporteReady(p: unknown): p is { toolCallId: string; type: string } {
  if (typeof p !== "object" || p === null || !("type" in p)) return false;
  if ((p as { type: string }).type !== "tool-generar_url_reporte") return false;
  if ((p as { state?: string }).state !== "output-available") return false;
  return (
    (p as { output?: { abrirAsistenteDescarga?: boolean } }).output
      ?.abrirAsistenteDescarga === true
  );
}

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
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "border border-border/60 bg-gradient-to-b from-card to-muted/20 text-foreground dark:border-white/10 dark:from-card/80 dark:to-card/50",
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
  const router = useRouter();
  const SUGGESTED = dict.chat.suggested;
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionBoot, setSessionBoot] = useState(false);
  const [sessionListKey, setSessionListKey] = useState(0);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        credentials: "include",
        prepareSendMessagesRequest: ({
          id,
          messages: msgs,
          body,
          trigger,
          messageId,
        }) => ({
          body: {
            ...(body && typeof body === "object" ? body : {}),
            id,
            messages: msgs,
            trigger,
            messageId,
            locale,
            ...(activeSessionId
              ? { sessionId: activeSessionId }
              : {}),
          },
        }),
      }),
    [locale, activeSessionId],
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
    id: "medicoach-main-chat",
    transport,
    experimental_throttle: 48,
  });

  useEffect(() => {
    if (!error?.message) return;
    if (
      error.message.includes("iniciar sesión") ||
      error.message.includes("Necesitás") ||
      error.message.includes("No autenticado")
    ) {
      void router.refresh();
    }
  }, [error, router]);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportNonce, setReportNonce] = useState(0);
  const seenReportTool = useRef(new Set<string>());

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/chat/sessions", {
          cache: "no-store",
          credentials: "include",
        });
        if (!r.ok) throw new Error("sessions");
        const { sessions } = (await r.json()) as { sessions: { id: string }[] };
        if (cancel) return;
        if (sessions?.length) {
          const top = sessions[0];
          const d = await fetch(`/api/chat/sessions/${top.id}`, {
            cache: "no-store",
            credentials: "include",
          });
          if (!d.ok) throw new Error("session");
          const j = (await d.json()) as { uiMessages: UIMessage[]; id: string };
          if (cancel) return;
          setActiveSessionId(j.id);
          setMessages(j.uiMessages.length ? j.uiMessages : []);
        } else {
          const p = await fetch("/api/chat/sessions", {
            method: "POST",
            credentials: "include",
          });
          if (!p.ok) throw new Error("post");
          const { id } = (await p.json()) as { id: string };
          if (cancel) return;
          setActiveSessionId(id);
          setMessages([]);
        }
      } catch {
        if (cancel) return;
        const local = loadChatUiMessages();
        if (local.length) {
          setMessages(local);
        }
      } finally {
        if (!cancel) setSessionBoot(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [setMessages]);

  useEffect(() => {
    if (!sessionBoot) return;
    saveChatUiMessages(messages);
  }, [messages, sessionBoot]);

  useEffect(() => {
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (const p of m.parts ?? []) {
        if (!isGenerarUrlReporteReady(p)) continue;
        const id = p.toolCallId;
        if (!id || seenReportTool.current.has(id)) continue;
        seenReportTool.current.add(id);
        setReportOpen(true);
        setReportNonce((n) => n + 1);
      }
    }
  }, [messages]);

  const busy = status === "streaming" || status === "submitted";
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recRef = useRef<BrowserSpeechRecognition | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const clientReady = useIsClient();
  const canDictate = clientReady && speechRecognitionSupported();
  const reportBtn =
    locale === "en" ? "PDF report" : "Reporte PDF";
  const historyLabel = locale === "en" ? "Chats" : "Charlas";
  const historyEmpty =
    locale === "en" ? "No saved chats yet." : "Todavía no hay charlas guardadas.";
  const endRef = useRef<HTMLDivElement>(null);

  const endMicStream = useCallback(() => {
    const s = micStreamRef.current;
    if (s) {
      s.getTracks().forEach((tr) => tr.stop());
    }
    micStreamRef.current = null;
    setMicStream(null);
  }, []);

  const startNewConversation = useCallback(async () => {
    if (busy) void stop();
    clearChatUiMessages();
    setInput("");
    setVoiceError(null);
    clearError();
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    endMicStream();
    recRef.current = null;
    setListening(false);
    setInterim("");
    try {
      const p = await fetch("/api/chat/sessions", {
        method: "POST",
        credentials: "include",
      });
      if (p.ok) {
        const { id } = (await p.json()) as { id: string };
        setActiveSessionId(id);
      } else {
        setActiveSessionId(null);
      }
    } catch {
      setActiveSessionId(null);
    }
    setMessages(() => []);
    setSessionListKey((k) => k + 1);
  }, [busy, clearError, endMicStream, setMessages, stop]);

  const loadSessionById = useCallback(
    async (id: string) => {
      if (busy) void stop();
      clearError();
      try {
        const d = await fetch(`/api/chat/sessions/${id}`, {
            cache: "no-store",
            credentials: "include",
          });
        if (!d.ok) return;
        const j = (await d.json()) as { uiMessages: UIMessage[]; id: string };
        setActiveSessionId(j.id);
        setMessages(j.uiMessages.length ? j.uiMessages : []);
        clearChatUiMessages();
        saveChatUiMessages(j.uiMessages);
      } catch {
        /* ignore */
      }
    },
    [busy, clearError, setMessages, stop],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, status]);

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    endMicStream();
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, [endMicStream]);

  const startListening = useCallback(async () => {
    setVoiceError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceError(t("chat.micBrowserUnsupported"));
      return;
    }
    if (busy) return;

    const lang = recLangForLocale(locale);

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        micStreamRef.current = stream;
        setMicStream(stream);
      } catch {
        micStreamRef.current = null;
        setMicStream(null);
        /* VU: sin stream igual podemos dictar con Web Speech. */
      }
    } else {
      micStreamRef.current = null;
      setMicStream(null);
    }

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
        endMicStream();
        setListening(false);
        setInterim("");
        recRef.current = null;
      };

      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      endMicStream();
      setVoiceError(t("chat.micInitError"));
      setListening(false);
    }
  }, [busy, endMicStream, locale, t, stopListening]);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
      const s = micStreamRef.current;
      if (s) {
        s.getTracks().forEach((tr) => tr.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  return (
    <>
    <div
      className="flex h-full w-full min-h-[min(56dvh,520px)] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-md ring-1 ring-black/5 dark:border-white/10 dark:bg-card/90 dark:ring-white/5 lg:min-h-0"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-background/95 via-primary/[0.05] to-background/95 px-3 py-3 backdrop-blur-sm sm:px-4 dark:via-primary/10">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="hidden h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20 sm:block"
            aria-hidden
          />
          <p className="font-heading truncate text-sm font-semibold text-foreground sm:text-base">
            {t("chat.todayWithAssistant")}
          </p>
          {!sessionBoot ? (
            <Loader2
              className="text-primary size-3.5 shrink-0 animate-spin"
              aria-label="Cargando"
            />
          ) : null}
        </div>
        <div className="flex max-w-[70%] shrink-0 items-center justify-end gap-0.5 sm:max-w-none sm:gap-1.5">
          <ChatSessionPicker
            activeId={activeSessionId}
            onSelect={(id) => void loadSessionById(id)}
            refreshKey={sessionListKey}
            busy={busy || !sessionBoot}
            label={historyLabel}
            emptyLabel={historyEmpty}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 rounded-full px-2.5 text-[11px] sm:gap-1.5 sm:px-3.5 sm:text-xs"
            onClick={() => {
              setReportOpen(true);
              setReportNonce((n) => n + 1);
            }}
            aria-label={reportBtn}
          >
            <FileText className="size-3.5" aria-hidden />
            <span className="max-[360px]:sr-only sm:inline">{reportBtn}</span>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-2.5 text-xs sm:px-3.5 sm:text-sm"
            onClick={startNewConversation}
          >
            <Plus className="size-3.5" aria-hidden />
            <span className="hidden min-[400px]:inline">{t("chat.newChat")}</span>
            <span className="min-[400px]:hidden">{t("chat.newChatShort")}</span>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-[300px] flex-1 px-3 py-3 sm:min-h-[380px] sm:px-5 sm:py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-0.5 py-2 sm:px-0 sm:py-4">
              <p className="w-full text-center font-heading text-lg font-semibold text-foreground sm:text-xl">
                {t("chat.howTodayTitle")}
              </p>
              <p className="w-full text-center text-sm leading-relaxed text-muted-foreground">
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
                        className="h-auto min-h-0 w-full min-w-0 max-w-full shrink items-start justify-start gap-0 !whitespace-normal rounded-xl border border-border/50 bg-background/90 px-3.5 py-2.5 text-left text-sm font-normal leading-relaxed break-words text-foreground text-balance shadow-none transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-sm"
                        onClick={() => {
                          if (busy || !sessionBoot) return;
                          void sendMessage({ text });
                        }}
                        disabled={busy || !sessionBoot}
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
            {friendlyChatApiError(error.message ?? "")}
          </p>
        ) : null}
        {voiceError ? (
          <p className="px-3 pb-1 text-sm text-destructive sm:px-4">
            {voiceError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border/50 bg-gradient-to-b from-background/80 to-muted/20 p-3 backdrop-blur-sm sm:p-4 dark:from-card/30 dark:to-background/30">
        <form
          className="mx-auto flex w-full max-w-2xl flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
            void sendMessage({ text });
            setInput("");
          }}
        >
          <div className="flex w-full min-w-0 items-stretch gap-2">
            <Input
              name="msg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.inputPlaceholder")}
              disabled={busy || !sessionBoot || listening}
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-xl border-border/60 bg-background/80"
              aria-label={t("chat.inputAria")}
            />
            <Button
              type="button"
              variant={listening ? "secondary" : "outline"}
              size="icon"
              className={cn(
                "h-12 shrink-0 self-center rounded-xl",
                listening ? "w-14" : "w-12",
              )}
              disabled={busy || !sessionBoot || !canDictate}
              onClick={() => (listening ? stopListening() : void startListening())}
              aria-pressed={listening}
              aria-label={
                listening ? t("chat.stopDictation") : t("chat.startDictation")
              }
            >
              {listening ? (
                <VoiceActivityMeter
                  active
                  mediaStream={micStream}
                  className="max-w-[2.1rem] px-0.5"
                  maxHeightClass="h-5"
                />
              ) : (
                <Mic className="size-4" aria-hidden />
              )}
            </Button>
            <Button
              type="submit"
              className="h-12 w-12 shrink-0 self-center rounded-xl"
              size="icon"
              disabled={busy || !sessionBoot || listening || !input.trim()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <SendHorizonal className="size-4" aria-hidden />
              )}
              <span className="sr-only">{t("chat.send")}</span>
            </Button>
          </div>
          {listening ? (
            <div
              className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-left text-xs leading-relaxed text-muted-foreground shadow-sm sm:px-3.5"
              role="status"
              aria-live="polite"
            >
              {interim ? (
                <>
                  <span className="mb-0.5 block text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/90">
                    {t("chat.listening")}
                  </span>
                  <p className="line-clamp-4 break-words text-foreground/90">
                    {interim}
                  </p>
                </>
              ) : (
                <p>{t("chat.listeningHelp")}</p>
              )}
            </div>
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
    <ReportPdfSheet
      open={reportOpen}
      onOpenChange={setReportOpen}
      autoStartNonce={reportNonce}
    />
    </>
  );
}

function MediChatLoadingShell() {
  const { t } = useLocale();
  return (
    <div
      className="flex h-full w-full min-h-[min(56dvh,520px)] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card px-4 py-12 text-sm text-muted-foreground shadow-md ring-1 ring-black/5 dark:border-white/10 dark:bg-card/80 dark:ring-white/5 lg:min-h-0"
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
    void queueMicrotask(() => {
      setTerms(getChatTermsAccepted());
    });
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
