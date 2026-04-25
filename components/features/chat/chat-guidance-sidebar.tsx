"use client";

import { FileText, HeartHandshake, Pill, Shield } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";

/**
 * Panel lateral: copys desde i18n, sin términos técnicos de producto.
 */
export function ChatGuidanceSidebar() {
  const { t } = useLocale();

  return (
    <aside
      className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-card/50 p-5 shadow-sm backdrop-blur-sm lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start"
      aria-label={t("sidebar.aria")}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold leading-snug text-foreground">
          {t("sidebar.title")}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t("sidebar.intro")}
        </p>
      </div>

      <ul className="space-y-3.5 text-sm">
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

      <p className="flex gap-2 border-t border-border/40 pt-4 text-xs leading-relaxed text-muted-foreground">
        <Shield
          className="mt-0.5 size-3.5 shrink-0 text-primary/80"
          aria-hidden
        />
        <span>{t("sidebar.foot")}</span>
      </p>
    </aside>
  );
}
