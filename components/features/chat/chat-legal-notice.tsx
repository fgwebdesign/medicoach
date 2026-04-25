"use client";

import { useId } from "react";
import { ChevronDown, Mic, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatLegalNoticeProps = {
  showMicNote: boolean;
  /** Si false, se muestran bordes redondeados arriba (p. ej. anidado bajo otra sección) */
  className?: string;
};

/**
 * Aviso legal visible y profesional. openFDA: datos públicos de la FDA (EE. UU.),
 * no implica aprobación del asistente por la FDA.
 */
export function ChatLegalNotice({
  showMicNote,
  className,
}: ChatLegalNoticeProps) {
  const id = useId();
  const detailsId = `${id}-mic`;

  return (
    <section
      className={cn(
        "border-b border-amber-500/20 bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-amber-50/20 text-amber-950 dark:border-amber-500/15 dark:from-amber-950/50 dark:via-amber-950/30 dark:to-amber-950/10 dark:text-amber-50/95",
        className,
      )}
      aria-labelledby={`${id}-title`}
    >
      <div className="px-3 py-3.5 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/25 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20"
              aria-hidden
            >
              <Shield className="size-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:gap-y-0">
                <h2
                  id={`${id}-title`}
                  className="font-heading text-sm font-bold tracking-tight text-amber-900 sm:text-base dark:text-amber-100"
                >
                  Aviso médico
                </h2>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-600/15 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900/90 sm:text-[11px] dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                  <Sparkles className="size-3 shrink-0" aria-hidden />
                  Información general, no diagnóstico
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-amber-900/95 sm:mt-2.5 sm:text-base dark:text-amber-50/95">
                Lo que leés acá <strong>no sustituye</strong> a un médico ni un
                diagnóstico. Son orientaciones educativas; en la duda, consultá
                a tu profesional de salud.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-start lg:grid-cols-[1fr_minmax(0,280px)]">
            <ul
              className="list-none space-y-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5 text-sm leading-relaxed text-amber-900/88 sm:p-4 sm:text-[15px] dark:border-amber-500/10 dark:bg-amber-950/25 dark:text-amber-100/85"
              role="list"
            >
              <li className="flex gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/70 dark:bg-amber-300/60"
                  aria-hidden
                />
                <span>
                  <strong className="text-amber-950 dark:text-amber-50">
                    Urgencia
                  </strong>
                  : dolor de pecho, ahogo, desmayo o debilidad repentina:{" "}
                  <strong>emergencias</strong>, no use esta charla.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/70 dark:bg-amber-300/60"
                  aria-hidden
                />
                <span>
                  Podés armar <strong>resúmenes</strong> con tu médico: la
                  decisión de tratamiento es de tu equipo clínico.
                </span>
              </li>
            </ul>

            <div
              className="flex min-h-0 flex-col justify-center rounded-2xl border border-emerald-600/25 bg-gradient-to-br from-emerald-50 via-white/70 to-sky-50/40 p-3.5 text-emerald-950 shadow-md ring-1 ring-emerald-500/10 dark:border-emerald-500/20 dark:from-emerald-950/70 dark:via-emerald-950/30 dark:to-sky-950/20 dark:text-emerald-50 dark:ring-emerald-400/5 sm:p-4"
              aria-label="Fuentes oficiales de medicación"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800/85 dark:text-emerald-200/90">
                Apoyo en medicación
              </p>
              <p className="mt-0.5 font-heading text-sm font-bold text-emerald-900 sm:text-base dark:text-emerald-100">
                Datos de openFDA (FDA, EE. UU.)
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900/90 sm:text-sm dark:text-emerald-100/88">
                Cuando tocamos fármacos, el asistente complementa con{" "}
                <strong>registros públicos</strong> vía openFDA, la
                <abbr title="Food and Drug Administration" className="no-underline">
                  &nbsp;FDA
                </abbr>{" "}
                de Estados Unidos (etiquetas y productos aprobados). Aporta
                <strong> trazabilidad y rigor</strong> al contenido, sin reemplazar
                tu receta ni la indicación de tu doctor.
              </p>
            </div>
          </div>

          {showMicNote ? (
            <details className="group rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] dark:border-amber-500/10 dark:bg-amber-950/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium text-amber-900/95 marker:hidden transition-colors hover:bg-amber-500/8 dark:text-amber-100/95 [&::-webkit-details-marker]:hidden sm:px-4">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
                    <Mic
                      className="size-3.5 text-amber-800 dark:text-amber-200"
                      aria-hidden
                    />
                  </span>
                  <span id={detailsId} className="leading-snug">
                    Dictado por voz en tu aparato
                  </span>
                </span>
                <ChevronDown
                  className="size-4 shrink-0 text-amber-700/50 transition-transform group-open:rotate-180 dark:text-amber-300/50"
                  aria-hidden
                />
              </summary>
              <div
                className="border-t border-amber-500/15 px-3.5 pb-3.5 text-xs leading-relaxed text-amber-900/82 dark:border-amber-500/10 dark:text-amber-100/78 sm:px-4"
                role="region"
                aria-labelledby={detailsId}
              >
                <p className="pt-2.5 sm:text-sm">
                  El micrófono pasa voz a texto en tu dispositivo; no guardamos
                  grabaciones de voz.
                </p>
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
