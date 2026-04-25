import Link from "next/link";
import { ArrowLeft, HeartPulse, Shield, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketingPageMain } from "@/components/layout/marketing-page-main";
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

const featureItems = [
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
] as const;

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
      <MarketingPageMain>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden text-white lg:grid lg:min-h-[calc(100dvh-3.75rem)] lg:grid-cols-2">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#043028] via-[#0a1f1c] to-[#021510]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_0%,oklch(0.42_0.1_175/0.2),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 mask-[linear-gradient(180deg,white,transparent_88%)] bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[1.5rem_1.5rem] opacity-35"
            aria-hidden
          />

          {/* Columna copy: centrada en el eje vertical y horizontal del panel */}
          <section className="relative flex min-h-[42vh] flex-col justify-center border-b border-white/10 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-0 lg:border-b-0 lg:border-r lg:border-white/10 lg:py-8">
            <div
              className="pointer-events-none absolute -right-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-10 bottom-1/3 size-64 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />

            <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center text-center sm:max-w-lg lg:max-w-lg">
              <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-primary/90">
                Acceso
              </p>
              <h1 className="mt-3 text-balance text-white">
                <span className="font-heading block text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
                  Un lugar tranquilo
                </span>
                <span className="font-hero-serif mt-2 block text-3xl font-medium italic leading-tight text-primary sm:text-4xl lg:text-[2.4rem]">
                  para tu salud.
                </span>
              </h1>
              <p className="mt-4 text-pretty text-base font-normal leading-relaxed text-white/75 sm:text-[17px]">
                Llevá el seguimiento de lo que te importa: síntomas, medicación
                y dudas para el médico, con claridad.
              </p>

              <ul className="mt-8 w-full space-y-2.5 text-left sm:mt-10">
                {featureItems.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 shadow-sm backdrop-blur-md sm:p-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center self-start rounded-xl border border-white/10 bg-white/5 text-primary sm:size-10">
                      <Icon className="size-4 sm:size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-semibold text-white">
                        {title}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-white/60">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Formulario: bloque centrado, más bajo, mismo tono (sin negro puro) */}
          <section className="relative flex flex-1 flex-col border-white/5 bg-gradient-to-b from-[#0a1f1c]/80 via-[#051210] to-[#021510] px-4 py-10 sm:px-8 lg:items-center lg:justify-center lg:px-10 lg:py-4">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_80%_20%,oklch(0.4_0.1_175/0.16),transparent_50%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/30 to-transparent"
              aria-hidden
            />

            <div className="relative z-10 flex w-full max-w-[440px] flex-1 flex-col justify-center sm:mx-auto lg:flex-none">
              <div className="flex flex-col items-center space-y-7 pt-4 sm:pt-[4vh]">
                <div className="w-full space-y-2 text-center">
                  <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
                    Bienvenido
                  </h2>
                  <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                    Iniciá sesión o creá una cuenta para acceder al chat, al
                    panel y a tu resumen.
                  </p>
                </div>

                <div
                  className="w-full rounded-[1.5rem] border border-white/15 p-5 shadow-2xl sm:p-8"
                  style={{
                    background:
                      "linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                  }}
                >
                  <div className="backdrop-blur-xl">
                    {!supabaseReady ? (
                      <div
                        className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-3 text-sm text-amber-100"
                        role="alert"
                      >
                        {process.env.NODE_ENV === "development" ? (
                          <>
                            Falta configurar el entorno. Revisá{" "}
                            <code className="rounded border border-amber-500/20 bg-amber-950/30 px-1.5 font-mono text-xs text-amber-50">
                              .env.local
                            </code>{" "}
                            y reiniciá el servidor de desarrollo.
                          </>
                        ) : (
                          <>
                            El inicio de sesión no está disponible en este
                            momento.
                          </>
                        )}
                      </div>
                    ) : null}
                    {err ? (
                      <div
                        className="mb-5 rounded-xl border border-red-400/35 bg-red-500/10 px-3.5 py-3 text-sm text-red-100"
                        role="alert"
                      >
                        {err}
                      </div>
                    ) : null}
                    <LoginForm afterAuthPath={afterAuthPath} onDark />
                  </div>
                </div>

                <p className="text-center">
                  <Button
                    variant="link"
                    className="h-auto gap-1.5 p-0 text-sm text-white/50 transition-colors hover:text-white"
                    asChild
                  >
                    <Link href="/">
                      <ArrowLeft className="size-3.5" aria-hidden />
                      Volver al inicio
                    </Link>
                  </Button>
                </p>
              </div>
            </div>
          </section>
        </div>
      </MarketingPageMain>
    </>
  );
}
