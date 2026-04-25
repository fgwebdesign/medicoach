"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const contentEase = [0.22, 1, 0.36, 1] as const;
const inView = { once: true as const, amount: 0.18, margin: "0px 0px -64px 0px" as const };
const inViewTight = { once: true as const, amount: 0.25, margin: "0px 0px -32px 0px" as const };

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

function fadeY(reduce: boolean, y: number, duration: number, delay: number) {
  if (reduce) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration, ease: contentEase, delay },
    viewport: inView,
  };
}

function sectionVariants(reduce: boolean, stagger: number): Variants {
  if (reduce) {
    return { hidden: { opacity: 1 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: 0.05 },
    },
  };
}

function itemVariant(reduce: boolean, y: number): Variants {
  if (reduce) {
    return { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } };
  }
  return {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: contentEase } },
  };
}

export function LandingView() {
  const reduce = useReducedMotion() ?? false;

  const heroStagger: Variants = reduce
    ? { hidden: {}, show: { transition: { staggerChildren: 0 } } }
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.1, delayChildren: 0.12 },
        },
      };

  const heroChild: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: contentEase },
        },
      };

  return (
    <main className="flex flex-1 flex-col">
      <section
        className="relative flex min-h-[min(90svh,920px)] flex-col overflow-hidden border-b border-border/60"
        aria-labelledby="hero-title"
      >
        <motion.div
          className="absolute inset-0 h-full w-full"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 1.1, ease: "easeOut" }}
        >
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
            aria-hidden
            preload="auto"
            src="/hero.mp4"
          />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0 bg-black/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-black/5 sm:from-black/70"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-4 pb-20 pt-28 sm:max-w-2xl sm:pb-28 sm:pt-32">
          <motion.div
            className="space-y-5 text-white"
            initial="hidden"
            animate="show"
            variants={heroStagger}
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90"
              variants={heroChild}
            >
              Acompañamiento en salud
            </motion.p>
            <motion.h1
              id="hero-title"
              className="font-heading text-balance text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.05]"
              variants={heroChild}
            >
              MediCoach, tu acompañante
            </motion.h1>
            <motion.p
              className="text-pretty text-lg text-white/90 sm:text-xl"
              variants={heroChild}
            >
              Ordená dudas, síntomas y la rutina — con voz clara y siempre
              al lado de tu médico, nunca en su lugar.
            </motion.p>
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              variants={heroChild}
            >
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 border-0 bg-primary px-7 text-base text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                <Link href="/chat">
                  Ir al chat
                  <MessageCircle className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/15"
              >
                <Link href="/login">
                  Entrar
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>
            <motion.p
              className="text-sm text-white/60"
              variants={heroChild}
            >
              Informativo · Cuenta gratuita
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section
        className="border-b border-border/50 bg-muted/15 py-12 sm:py-16"
        aria-labelledby="quick-title"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          <motion.div
            className="mb-6 text-center sm:mb-8 sm:text-left"
            {...fadeY(reduce, 18, 0.5, 0)}
            viewport={inViewTight}
          >
            <h2
              id="quick-title"
              className="font-heading text-lg font-bold tracking-tight sm:text-xl"
            >
              A dónde ir
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat, panel y reporte para el consultorio.
            </p>
          </motion.div>
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={inView}
            variants={sectionVariants(reduce, 0.08)}
          >
            <motion.div variants={itemVariant(reduce, 20)} className="h-full">
              <Link
                href="/chat"
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm ring-1 ring-black/5 transition hover:border-primary/30 hover:shadow-md dark:bg-card/90 dark:ring-white/5"
              >
                <div className="space-y-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageCircle className="size-5" aria-hidden />
                  </span>
                  <p className="font-heading text-base font-semibold leading-tight">
                    Chat
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Preguntas, síntomas o medicación, en lenguaje cotidiano.
                  </p>
                </div>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-1.5">
                  Abrir
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariant(reduce, 20)} className="h-full">
              <Link
                href="/dashboard"
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm ring-1 ring-black/5 transition hover:border-primary/30 hover:shadow-md dark:bg-card/90 dark:ring-white/5"
              >
                <div className="space-y-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LayoutDashboard className="size-5" aria-hidden />
                  </span>
                  <p className="font-heading text-base font-semibold leading-tight">
                    Panel
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conversación, historial y accesos en un vistazo.
                  </p>
                </div>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-1.5">
                  Entrar
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariant(reduce, 24)}
              className="relative sm:col-span-2"
            >
              <div
                className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-primary/5 opacity-80 dark:from-primary/20"
                aria-hidden
              />
              <Card className="relative border-border/80 bg-card/95 shadow-md backdrop-blur-sm dark:bg-card/90">
                <CardHeader className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 text-primary">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                        <HeartPulse className="size-6" aria-hidden />
                      </span>
                      <div>
                        <p className="font-heading text-lg font-semibold tracking-tight">
                          Para el día a día
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Entre un turno y el otro: un lugar para ordenar dudas.
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-foreground/80">
                    Medicación, síntomas, cambios de rutina: anotá con claridad
                    y llevá un resumen cuando toque.
                  </CardDescription>
                  <Button
                    variant="secondary"
                    className="w-full gap-2 sm:w-auto"
                    asChild
                  >
                    <Link href="/report">
                      Preparar reporte para el médico
                      <FileText className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        className="border-b border-border/50 bg-muted/20 py-16 sm:py-20"
        aria-labelledby="benefits-title"
      >
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            {...fadeY(reduce, 20, 0.5, 0)}
            viewport={inViewTight}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Por qué elegirlo
            </p>
            <h2
              id="benefits-title"
              className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Por qué usar MediCoach
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
              No es una receta mágica: te ayudamos a ordenar lo que te pasa y
              llegar al consultorio con mejores preguntas, no con más ruido.
            </p>
          </motion.div>
          <motion.ul
            className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6"
            initial="hidden"
            whileInView="show"
            viewport={inView}
            variants={sectionVariants(reduce, 0.1)}
          >
            {benefits.map(({ title, description, icon: Icon }) => (
              <motion.li
                key={title}
                variants={itemVariant(reduce, 32)}
                className="h-full"
              >
                <Card className="h-full border-border/70 transition-shadow hover:shadow-md">
                  <CardHeader className="space-y-3 pt-6">
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
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="steps-title">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
            <motion.div
              className="lg:sticky lg:top-24"
              {...fadeY(reduce, 24, 0.55, 0)}
              viewport={inViewTight}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Flujo
              </p>
              <h2
                id="steps-title"
                className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Tres pasos, sin complicaciones
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
                Nada de formularios eternos: empezás cuando quieras y seguís
                cuando puedas. La idea es acompañarte, no llenarte de tareas.
              </p>
              <Button asChild className="mt-8 gap-2" size="lg">
                <Link href="/chat">
                  Probar en el chat
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>
            <ol className="relative space-y-0 border-l-2 border-primary/20 pl-6 sm:pl-8">
              {steps.map(({ step, title, body }, i) => (
                <motion.li
                  key={step}
                  className={`relative pb-8 last:pb-0 ${i === 0 ? "-mt-1" : ""}`}
                  {...fadeY(reduce, 20, 0.45, reduce ? 0 : i * 0.1)}
                  viewport={inViewTight}
                >
                  <span
                    className="absolute -left-[1.3rem] top-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary/15 font-heading text-xs font-bold text-primary sm:-left-[1.6rem] sm:size-8 sm:text-sm"
                    aria-hidden
                  >
                    {step}
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
                    <p className="font-heading font-semibold tracking-tight">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="border-t border-border/60 bg-gradient-to-b from-[var(--mc-teal-bg)]/50 to-background py-16 dark:from-primary/10 dark:to-background sm:py-20"
        aria-labelledby="cta-title"
      >
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center"
          initial="hidden"
          whileInView="show"
          viewport={inViewTight}
          variants={sectionVariants(reduce, 0.1)}
        >
          <motion.span
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20"
            aria-hidden
            variants={itemVariant(reduce, 16)}
          >
            <FileText className="size-7" />
          </motion.span>
          <motion.h2
            id="cta-title"
            className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
            variants={itemVariant(reduce, 16)}
          >
            Llevá un resumen a tu próxima consulta
          </motion.h2>
          <motion.p
            className="text-pretty text-muted-foreground sm:text-lg"
            variants={itemVariant(reduce, 16)}
          >
            En reporte podés reunir lo importante para mostrar a quien te
            atiende. Siempre como apoyo, nunca en lugar de la decisión médica.
          </motion.p>
          <motion.div
            className="mt-1 flex flex-col gap-3 sm:flex-row sm:justify-center"
            variants={itemVariant(reduce, 12)}
          >
            <Button asChild size="lg" className="gap-2" variant="default">
              <Link href="/report">
                Abrir reporte
                <FileText className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-border/80 bg-background/90"
            >
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </motion.div>
          <motion.p
            className="max-w-xl text-xs leading-relaxed text-muted-foreground"
            variants={itemVariant(reduce, 8)}
          >
            MediCoach ofrece información general y educativa. No diagnostica ni
            prescribe. Ante urgencias o síntomas graves, acudí a emergencias o
            a tu médico de referencia.
          </motion.p>
        </motion.div>
      </section>

      <motion.footer
        className="border-t border-border/60 py-8"
        {...fadeY(reduce, 12, 0.4, 0)}
        viewport={inViewTight}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <span>MediCoach · Montevideo</span>
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </motion.footer>
    </main>
  );
}
