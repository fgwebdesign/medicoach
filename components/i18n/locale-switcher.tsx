"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "./locale-provider";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: { value: Locale; short: string }[] = [
  { value: "es", short: "ES" },
  { value: "en", short: "EN" },
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
            "min-w-9 rounded px-1.5 py-1 text-xs font-semibold transition-colors",
            locale === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={locale === o.value}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
