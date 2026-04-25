"use client";

import { FileText, HeartHandshake, Pill, Shield } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/**
 * Panel lateral: copys desde i18n, sin términos técnicos de producto.
 */
export function ChatGuidanceSidebar() {
  const { t } = useLocale();

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col gap-5 rounded-2xl border border-border/60 p-5",
        "bg-card/90 shadow-sm ring-1 ring-black/5 backdrop-blur-sm",
        "dark:border-white/10 dark:bg-card/50 dark:ring-white/5",
        "lg:overflow-hidden",
      )}
      aria-label={t("sidebar.aria")}
    >
      <div className="shrink-0">
        <h2 className="font-heading text-lg font-semibold leading-snug text-foreground">
          {t("sidebar.title")}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t("sidebar.intro")}
        </p>
      </div>

      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5 text-sm overscroll-y-contain">
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HeartHandshake className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">{t("sidebar.s1")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t("sidebar.s1b")}
            </p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Pill className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">{t("sidebar.s2")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t("sidebar.s2b")}
            </p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">{t("sidebar.s3")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t("sidebar.s3b")}
            </p>
          </div>
        </li>
      </ul>

      <p className="flex shrink-0 gap-2 border-t border-border/40 pt-4 text-xs leading-relaxed text-muted-foreground">
        <Shield
          className="mt-0.5 size-3.5 shrink-0 text-primary/80"
          aria-hidden
        />
        <span>{t("sidebar.foot")}</span>
      </p>
    </aside>
  );
}
