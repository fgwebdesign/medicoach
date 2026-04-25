import Link from "next/link";
import { MAIN_NAV } from "@/config/navigation";
import { createClient } from "@/lib/integrations/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function SiteHeader() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    /* build sin env o cliente sin Supabase */
  }

  const navItems = MAIN_NAV.filter((item) => item.href !== "/login");

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="shrink-0 font-heading text-lg font-semibold tracking-tight text-primary"
        >
          MediCoach
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {navItems.map(({ href, label }) => (
            <Button key={href} variant="ghost" size="sm" asChild>
              <Link href={href}>{label}</Link>
            </Button>
          ))}
          <ThemeToggle />
          {email ? (
            <>
              <span
                className="hidden max-w-[160px] truncate text-xs text-muted-foreground lg:inline"
                title={email}
              >
                {email}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/sign-out">Salir</Link>
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
