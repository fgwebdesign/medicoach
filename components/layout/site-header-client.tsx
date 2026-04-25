"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitch } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { getInitialsFromEmail } from "@/lib/user/initials";

type SiteHeaderClientProps = {
  initialEmail: string | null;
};

export function SiteHeaderClient({ initialEmail }: SiteHeaderClientProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const initials = initialEmail ? getInitialsFromEmail(initialEmail) : null;

  return (
    <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-5">
      <Link
        href="/"
        className="group shrink-0 font-heading text-base font-semibold tracking-tight text-primary sm:text-lg"
      >
        <span className="transition group-hover:text-primary/85">MediCoach</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <nav
          className="flex min-w-0 items-center gap-0.5 sm:gap-1"
          aria-label="Principal"
        >
          {MAIN_NAV.map(({ href, key }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                  active
                    ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <div
          className="hidden h-5 w-px shrink-0 bg-border/70 sm:block"
          aria-hidden
        />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LocaleSwitch className="shrink-0" />
          <ThemeToggle />
          {initialEmail && initials ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-gradient-to-br from-primary/18 to-primary/5 text-[10px] font-bold uppercase tracking-tight text-primary shadow-inner ring-1 ring-black/5 dark:ring-white/10 sm:h-9 sm:w-9 sm:text-[11px]"
                title={initialEmail}
              >
                {initials}
              </div>
              <span
                className="hidden max-w-[10rem] truncate text-xs text-muted-foreground md:inline lg:max-w-[14rem]"
                title={initialEmail}
              >
                {initialEmail}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 rounded-lg border-2 border-primary/40 bg-primary/12 px-2.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/60 hover:bg-primary/20 sm:h-9 sm:px-3.5 sm:text-sm"
                asChild
              >
                <Link href="/auth/sign-out">{t("nav.signOut")}</Link>
              </Button>
            </div>
          ) : (
            <Button size="sm" className="h-8 shrink-0 rounded-lg sm:h-9" asChild>
              <Link href="/login" className="px-3 text-xs sm:text-sm">
                {t("nav.signIn")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
