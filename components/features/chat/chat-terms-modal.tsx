"use client";

import { useId, useState } from "react";
import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/locale-provider";
import { setChatTermsAccepted } from "@/lib/chat/terms-storage";
import { cn } from "@/lib/utils";

type ChatTermsModalProps = {
  open: boolean;
  onAccepted: () => void;
};

/**
 * Términos iniciales: aceptación obligatoria antes del chat.
 * No se puede cerrar con Escape ni clic afuera hasta aceptar.
 */
export function ChatTermsModal({ open, onAccepted }: ChatTermsModalProps) {
  const { t, locale } = useLocale();
  const [agreed, setAgreed] = useState(false);
  const errId = useId();

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="z-[60] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <div className="max-h-[min(88dvh,720px)] overflow-y-auto">
          <div className="bg-gradient-to-b from-amber-50/95 to-background px-4 pt-4 pb-3 sm:px-5 sm:pt-5 dark:from-amber-950/40">
            <DialogHeader className="gap-2 space-y-0 text-left sm:pr-1">
              <div className="flex items-start gap-3">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200"
                  aria-hidden
                >
                  <Shield className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800/80 dark:text-amber-200/90">
                    MediCoach
                  </p>
                  <DialogTitle asChild>
                    <h2 className="font-heading text-lg font-bold leading-tight sm:text-xl">
                      {t("terms.title")}
                    </h2>
                  </DialogTitle>
                  <span className="mt-1 inline-block rounded-full border border-amber-600/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900/90 dark:border-amber-500/20 dark:text-amber-200">
                    {t("terms.badge")}
                  </span>
                </div>
              </div>
              <DialogDescription asChild>
                <div className="pt-1 text-left text-sm leading-relaxed text-foreground/90 sm:text-base">
                  <p className="mt-0.5">{t("terms.lead")}</p>
                  <ul className="mt-3 list-none space-y-2 pl-0 text-sm text-foreground/85">
                    <li className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/70"
                        aria-hidden
                      />
                      {t("terms.emergency")}
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/70"
                        aria-hidden
                      />
                      {t("terms.professional")}
                    </li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="border-t border-border/50 bg-card px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("terms.fdaTitle")}
            </p>
            <div
              className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4"
              lang={locale === "en" ? "en" : "es"}
            >
              <figure className="flex shrink-0 flex-col items-center gap-1.5 sm:items-start">
                <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <img
                    src="/Logo_of_the_United_States_Food_and_Drug_Administration.svg"
                    alt={t("terms.fdaLogoAlt")}
                    width={160}
                    height={80}
                    className="mx-auto h-12 w-auto max-w-[200px] object-contain sm:h-14"
                    loading="eager"
                  />
                </div>
                <figcaption className="max-w-[200px] text-center text-[10px] leading-tight text-muted-foreground sm:text-left">
                  {t("terms.fdaAttribution")}
                </figcaption>
              </figure>
              <div className="min-w-0 flex-1 space-y-2 text-sm leading-snug text-foreground/90 sm:text-base">
                <p className="text-center sm:text-left">{t("terms.fdaLine")}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
              {t("terms.micDetail")}
            </p>
          </div>
        </div>

        <DialogFooter className="m-0 flex flex-col items-stretch gap-3 border-t border-border/60 bg-muted/20 px-4 py-4 sm:flex-col sm:px-5">
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-background/80 p-3 text-left text-sm leading-snug text-foreground",
              !agreed && "ring-0",
            )}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border text-primary"
              aria-invalid={!agreed}
              aria-describedby={!agreed ? errId : undefined}
            />
            <span className="text-[13px] sm:text-sm">{t("terms.checkbox")}</span>
          </label>
          <span id={errId} className="sr-only">
            {agreed
              ? ""
              : "Marcá la casilla para continuar. / Check the box to continue."}
          </span>
          <Button
            type="button"
            className="h-12 w-full rounded-xl text-sm font-semibold sm:text-base"
            disabled={!agreed}
            onClick={() => {
              setChatTermsAccepted();
              onAccepted();
            }}
          >
            {t("terms.cta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
