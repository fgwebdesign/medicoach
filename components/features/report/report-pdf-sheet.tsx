"use client";

import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Pill,
  Stethoscope,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const STEPS: { id: string; label: string; Icon: ComponentType<{ className?: string }> }[] =
  [
    { id: "perfil", label: "Leyendo tu perfil", Icon: Stethoscope },
    { id: "sintomas", label: "Síntomas (últ. 14 días)", Icon: Activity },
    { id: "meds", label: "Medicación activa", Icon: Pill },
    { id: "charla", label: "Resumen de charla con el asistente", Icon: MessageSquare },
    { id: "pdf", label: "Componer PDF y descargar", Icon: FileText },
  ];

type Phase = "running" | "success" | "error";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  autoStartNonce?: number;
};

export function ReportPdfSheet({ open, onOpenChange, autoStartNonce = 0 }: Props) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [visStep, setVisStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const acRef = useRef<AbortController | null>(null);
  const stepIv = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAnim = useCallback(() => {
    if (stepIv.current) {
      clearInterval(stepIv.current);
      stepIv.current = null;
    }
  }, []);

  const goFetch = useCallback(async () => {
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;
    setPhase("running");
    setErr(null);
    setVisStep(0);
    clearAnim();
    stepIv.current = setInterval(() => {
      setVisStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 480);

    try {
      const res = await fetch("/api/report", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: ac.signal,
      });
      if (res.status === 401) {
        setPhase("error");
        setErr("Sesión vencida. Volvé a iniciar sesión e intentá de nuevo.");
        return;
      }
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        if (ct.includes("application/json")) {
          const j = (await res.json()) as { error?: string; details?: string };
          let m = j.error ?? `Error ${res.status}`;
          if (j.details) m = `${m} (${j.details})`;
          setErr(m);
        } else {
          setErr("No se pudo generar el reporte. Probá otra vez.");
        }
        setPhase("error");
        return;
      }
      if (!ct.includes("application/pdf")) {
        setErr("El servidor no devolvió un PDF.");
        setPhase("error");
        return;
      }
      const blob = await res.blob();
      setVisStep(STEPS.length);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MediCoach-reporte-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.rel = "nofollow";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPhase("success");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setErr(
        e instanceof Error
          ? e.message
          : "Error de conexión. Revisá la red e intentá otra vez.",
      );
      setPhase("error");
    } finally {
      clearAnim();
    }
  }, [clearAnim]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        acRef.current?.abort();
        clearAnim();
      }
      onOpenChange(v);
    },
    [onOpenChange, clearAnim],
  );

  useLayoutEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      void goFetch();
    });
  }, [open, autoStartNonce, goFetch]);

  const running = phase === "running";
  const success = phase === "success";
  const error = phase === "error";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 border-l border-border/60 p-0 sm:max-w-lg"
        aria-describedby="report-pdf-desc"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-border/50 px-4 py-4 text-left sm:px-5">
          <SheetTitle className="font-heading text-lg">Armar el reporte</SheetTitle>
          <SheetDescription id="report-pdf-desc" className="text-left text-sm">
            Seguís el avance mientras juntamos datos y generamos el PDF para el médico.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {open && (
            <ol className="ml-0.5 space-y-0">
              {STEPS.map((step, index) => {
                const isPast = success || visStep > index;
                const isCurrent = running && visStep === index;
                const Icon = step.Icon;
                return (
                  <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                    {index < STEPS.length - 1 ? (
                      <div
                        className={cn(
                          "bg-border absolute top-8 left-4 w-0.5 -translate-x-1/2",
                          (success || isPast) && "bg-primary/50",
                        )}
                        style={{ height: "calc(100% - 0.5rem)" }}
                        aria-hidden
                      />
                    ) : null}
                    <div
                      className={cn(
                        "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                        (isPast && !isCurrent) || success
                          ? "border-primary bg-primary/10"
                          : isCurrent
                            ? "border-primary bg-primary/15 shadow-sm"
                            : "border-border bg-muted/40",
                      )}
                    >
                      {success || (isPast && !isCurrent) ? (
                        <Check className="text-primary size-3.5" strokeWidth={2.5} />
                      ) : isCurrent ? (
                        <Loader2 className="text-primary size-3.5 animate-spin" />
                      ) : (
                        <Icon className="text-muted-foreground size-3.5 opacity-60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          (isCurrent || isPast || success) && "text-foreground",
                          !isCurrent && !isPast && !success && "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                      {isCurrent && running ? (
                        <p className="text-primary mt-0.5 text-xs">En progreso…</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {error && err ? (
            <div
              className="mt-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{err}</span>
            </div>
          ) : null}

          {success ? (
            <div
              className="mt-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"
              role="status"
            >
              <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Listo</p>
                <p className="text-muted-foreground text-xs">
                  Debería haberse descargado el PDF. Buscá en la carpeta de bajadas.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border/50 p-4 sm:px-5">
          {error ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => void goFetch()}>
                Reintentar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cerrar
              </Button>
            </div>
          ) : success ? (
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="secondary"
              disabled={running}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
