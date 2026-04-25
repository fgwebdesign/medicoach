import Link from "next/link";
import { HeartPulse, Shield, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { LoginForm } from "@/components/features/auth/login-form";
import { Button } from "@/components/ui/button";

function safePostAuthPath(value: string | undefined): string {
  if (!value) return "/dashboard";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("..") ||
    /[\s\0]/.test(value) ||
    value.length > 256
  ) {
    return "/dashboard";
  }
  return value;
}

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const err = q.error ? decodeURIComponent(q.error) : undefined;
  const afterAuthPath = safePostAuthPath(q.next);
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()),
  );

  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background lg:grid lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2">
        {/* Fondo: capas tipo producto (referencia: sistemas con canvas suave) */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_15%_10%,oklch(0.75_0.06_175/0.22),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_circle_at_85%_60%,oklch(0.6_0.08_175/0.12),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 mask-[linear-gradient(180deg,white,transparent_85%)] bg-[linear-gradient(to_right,oklch(0.5_0.02_250/0.06)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.02_250/0.06)_1px,transparent_1px)] bg-size-[2.5rem_2.5rem] opacity-50 dark:opacity-30"
          aria-hidden
        />

        <section className="relative flex flex-col justify-between border-b border-border/40 bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] px-6 py-10 sm:px-10 sm:py-12 lg:min-h-0 lg:border-b-0 lg:border-r lg:border-border/30 lg:py-14 dark:from-primary/[0.1] dark:via-card/30 dark:to-background">
          <div
            className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-10 bottom-0 size-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 max-w-lg space-y-5">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Acceso
            </p>
            <h1 className="font-heading text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.4rem] lg:leading-[1.1]">
              Un lugar tranquilo para tu salud
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Llevá el seguimiento de lo que te importa: síntomas, medicación y
              dudas para el médico, con claridad.
            </p>
          </div>

          <ul className="relative z-10 mt-10 space-y-5 lg:mt-0">
            {[
              {
                icon: HeartPulse,
                title: "A tu ritmo",
                text: "Conversá cuando puedas, sin apuros ni formularios eternos.",
              },
              {
                icon: Sparkles,
                title: "Información clara",
                text: "Te ayudamos a entender, sin reemplazar al profesional que te trata.",
              },
              {
                icon: Shield,
                title: "Solo tuyo",
                text: "Tu historial y tus datos vinculados a tu cuenta.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-border/40 bg-background/50 p-4 shadow-sm backdrop-blur-sm dark:bg-card/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 lg:py-12">
          <div className="mx-auto w-full max-w-[440px] space-y-8">
            <div className="space-y-1 text-center lg:text-left">
              <p className="font-heading text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                Bienvenido
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                Iniciá sesión o creá una cuenta para acceder al chat, al panel
                y a tu resumen.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl shadow-primary/[0.06] ring-1 ring-border/30 backdrop-blur-md dark:bg-card/50 sm:p-8">
              {!supabaseReady ? (
                <div
                  className="mb-5 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-950 dark:text-amber-100"
                  role="alert"
                >
                  {process.env.NODE_ENV === "development" ? (
                    <>
                      Falta configurar el entorno. Revisá{" "}
                      <code className="rounded bg-muted px-1.5 font-mono text-xs">
                        .env.local
                      </code>{" "}
                      y reiniciá el servidor de desarrollo.
                    </>
                  ) : (
                    <>El inicio de sesión no está disponible en este momento.</>
                  )}
                </div>
              ) : null}
              {err ? (
                <div
                  className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {err}
                </div>
              ) : null}
              <LoginForm afterAuthPath={afterAuthPath} />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              <Button
                variant="link"
                className="h-auto p-0 font-medium text-foreground/80"
                asChild
              >
                <Link href="/">Volver al inicio</Link>
              </Button>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
