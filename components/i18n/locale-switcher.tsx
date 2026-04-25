"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "./locale-provider";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: {
  value: Locale;
  short: string;
  flag: string;
  name: string;
}[] = [
  { value: "es", short: "ES", flag: "🇪🇸", name: "Español" },
  { value: "en", short: "EN", flag: "🇺🇸", name: "English" },
];

/**
 * Conmuta idioma; persiste en localStorage. Compacto para mobile.
 */
export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5",
        className,
      )}
      role="group"
      aria-label="Idioma / Language"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLocale(o.value)}
          className={cn(
            "inline-flex min-w-10 items-center justify-center gap-1 rounded px-1.5 py-1.5 text-xs font-semibold transition-colors sm:min-w-11",
            locale === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={locale === o.value}
          title={o.name}
        >
          <span className="text-sm leading-none" aria-hidden>
            {o.flag}
          </span>
          <span className="leading-none tracking-tight">{o.short}</span>
        </button>
      ))}
    </div>
  );
}
