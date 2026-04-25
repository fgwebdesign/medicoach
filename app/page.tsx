import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HeartPulse,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const benefits = [
  {
    title: "Conversación a tu ritmo",
    description:
      "Hacé preguntas sobre síntomas, medicación o hábitos cuando te quede cómodo. Respuestas en lenguaje claro, sin apuro.",
    icon: MessageCircle,
  },
  {
    title: "Información que podés contrastar",
    description:
      "Te ayudamos a entender mejor tu condición con contenido educativo pensado para acompañarte entre consultas.",
    icon: Sparkles,
  },
  {
    title: "Tu espacio, bajo control",
    description:
      "Con cuenta propia podés guardar el chat y armar un resumen para llevar al médico cuando lo necesites.",
    icon: Shield,
  },
] as const;

const steps = [
  {
    step: "1",
    title: "Contanos qué te preocupa",
    body: "Escribí con tus palabras: un malestar, una duda sobre el tratamiento o cómo venís con la rutina.",
  },
  {
    step: "2",
    title: "Recibí orientación ordenada",
    body: "MediCoach te responde con calma y te sugiere cuándo conviene hablar con un profesional de la salud.",
  },
  {
    step: "3",
    title: "Llevá lo importante al consultorio",
    body: "Desde tu panel podés ver el chat y preparar un reporte para compartir con tu equipo médico.",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_50%_-15%,var(--mc-teal-bg),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.35_0.08_175/0.35),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-14 sm:pb-24 sm:pt-20 lg:flex-row lg:items-center lg:gap-16 lg:pt-24">
            <div className="max-w-xl flex-1 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Acompañamiento en salud
              </p>
              <h1 className="font-heading text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Tu día a día con una condición crónica, más simple de entender
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                MediCoach es un asistente que te escucha, ordena ideas y te ayuda
                a preparar las conversaciones con tu médico — sin reemplazarlo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-12 gap-2 px-8 text-base shadow-md shadow-primary/15">
                  <Link href="/chat">
                    Hablar con MediCoach
                    <MessageCircle className="size-5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 gap-2 border-primary/25 bg-background/80 px-8 text-base backdrop-blur"
                >
                  <Link href="/login">
                    Entrar o crear cuenta
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Para usar el chat necesitás iniciar sesión o crear una cuenta: así
                guardamos tu conversación de forma segura y podés retomar el hilo
                cuando vuelvas. El asistente solo está disponible con cuenta.
              </p>
            </div>
            <div className="flex flex-1 justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/5 blur-2xl"
                  aria-hidden
                />
                <Card className="relative border-border/80 bg-card/95 shadow-lg shadow-primary/5 backdrop-blur-sm">
                  <CardHeader className="space-y-4 p-6 sm:p-8">
                    <div className="flex items-center gap-3 text-primary">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                        <HeartPulse className="size-6" aria-hidden />
                      </span>
                      <span className="font-heading text-lg font-semibold tracking-tight">
                        Pensado para vos
                      </span>
                    </div>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      Medicación, síntomas o cambios de rutina: muchas veces
                      quedan dudas entre una consulta y la otra. Acá tenés un
                      lugar para volcarlas con claridad.
                    </CardDescription>
                    <Button variant="secondary" className="w-full gap-2" asChild>
                      <Link href="/dashboard">
                        Ir a tu panel
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/40 bg-muted/25 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Por qué usar MediCoach
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
                No es una receta mágica: es una herramienta para ordenar lo que
                te pasa y sentirte más preparado.
              </p>
            </div>
            <ul className="mt-12 grid gap-6 sm:grid-cols-3">
              {benefits.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <Card className="h-full border-border/70 transition-colors hover:border-primary/25 hover:shadow-md">
                    <CardHeader className="space-y-4">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <CardTitle className="font-heading text-lg leading-snug">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Cómo funciona
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  Tres pasos, sin complicaciones
                </h2>
                <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
                  Nada de formularios eternos: empezás cuando quieras y seguís
                  cuando puedas.
                </p>
                <Button asChild className="mt-8 gap-2" size="lg">
                  <Link href="/chat">
                    Empezar ahora
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
              <ol className="space-y-4">
                {steps.map(({ step, title, body }) => (
                  <li
                    key={step}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary"
                      aria-hidden
                    >
                      {step}
                    </span>
                    <div>
                      <p className="font-heading font-semibold tracking-tight">
                        {title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-gradient-to-b from-[var(--mc-teal-bg)]/40 to-background py-16 dark:from-primary/10 dark:to-background sm:py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FileText className="size-7" aria-hidden />
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Llevá un resumen a tu próxima consulta
            </h2>
            <p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
              Desde la sección de reporte podés reunir lo importante para mostrar
              a quien te atiende — siempre como apoyo a la decisión médica, nunca
              en su lugar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="default" className="gap-2">
                <Link href="/report">
                  Ver reporte
                  <FileText className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 bg-background/80">
                <Link href="/login">Tengo cuenta</Link>
              </Button>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
              MediCoach ofrece información general y educativa. No diagnostica ni
              prescribe. Ante urgencias o síntomas graves, acudí a emergencias o
              a tu médico de referencia.
            </p>
          </div>
        </section>

        <footer className="border-t border-border/60 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
            <span>MediCoach · Montevideo</span>
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
