"use client";

import Link from "next/link";
import { MAIN_NAV } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitch } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

type SiteHeaderClientProps = {
  initialEmail: string | null;
};

export function SiteHeaderClient({ initialEmail }: SiteHeaderClientProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
      <Link
        href="/"
        className="shrink-0 font-heading text-base font-semibold tracking-tight text-primary sm:text-lg"
      >
        MediCoach
      </Link>
      <nav
        className="flex min-w-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1.5"
        aria-label="Principal"
      >
        {MAIN_NAV.map(({ href, key }) => (
          <Button key={href} variant="ghost" size="sm" asChild>
            <Link href={href} className="px-2 text-xs sm:px-3 sm:text-sm">
              {t(`nav.${key}`)}
            </Link>
          </Button>
        ))}
        <LocaleSwitch className="shrink-0" />
        <ThemeToggle />
        {initialEmail ? (
          <>
            <span
              className="hidden max-w-[120px] truncate text-xs text-muted-foreground sm:max-w-[160px] lg:inline"
              title={initialEmail}
            >
              {initialEmail}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/sign-out" className="shrink-0 text-xs sm:text-sm">
                {t("nav.signOut")}
              </Link>
            </Button>
          </>
        ) : (
          <Button size="sm" asChild>
            <Link href="/login" className="shrink-0 text-xs sm:text-sm">
              {t("nav.signIn")}
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
