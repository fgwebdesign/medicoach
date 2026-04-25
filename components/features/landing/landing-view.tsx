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
    <div className="relative z-10 flex flex-1 flex-col">
      <section
        className="font-sans relative flex min-h-[min(100svh,960px)] flex-col justify-center overflow-hidden border-b border-border/60"
        aria-labelledby="hero-title"
      >
        {/* Video: fondo a todo el ancho del hero */}
        <div className="absolute inset-0" aria-hidden>
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
            preload="auto"
            src="/hero.mp4"
            aria-hidden
          />
        </div>

        {/* Overlay verde bosque + leve viñeta para legibilidad */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#043028]/[0.88] via-[#0a3d32]/[0.82] to-[#021612]/[0.9]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_0%,oklch(0.42_0.1_175/0.22),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
          aria-hidden
        />

        <div
          className="relative z-10 flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pb-12 pt-[6vh] sm:px-6 sm:pb-16 sm:pt-[7vh] lg:px-10"
        >
          <motion.div
            className="mx-auto flex w-full max-w-2xl flex-col items-center gap-9 sm:gap-10"
            initial="hidden"
            animate="show"
            variants={heroStagger}
          >
            <motion.div
              className="w-full text-center text-white"
              variants={heroChild}
            >
              <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary/95">
                Acompañamiento en salud
              </p>
              <h1
                id="hero-title"
                className="mt-3 w-full text-balance"
              >
                <span className="block text-base font-medium leading-snug text-white/90 sm:text-lg">
                  Entre un turno y el otro
                </span>
                <span className="font-hero-serif mt-2 block text-4xl font-medium italic leading-[1.08] text-primary sm:mt-3 sm:text-5xl sm:leading-[1.06] lg:text-6xl">
                  con voz clara.
                </span>
                <span className="font-heading mt-2 block text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl lg:text-4xl">
                  MediCoach
                </span>
              </h1>
              <p className="mt-4 text-pretty text-sm font-normal leading-relaxed text-white/75 sm:text-base">
                Dudas y rutina, en lenguaje humano. Siempre con tu médico, no
                en su lugar.
              </p>
              <p className="font-heading mt-5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Acompañamiento en vivo
              </p>
            </motion.div>

            <motion.div
              className="w-full max-w-md"
              variants={heroChild}
            >
              <div
                className="rounded-[1.75rem] border border-white/20 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl sm:p-7"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
                }}
              >
                <p className="font-heading text-sm font-medium text-white/95 sm:text-base">
                  Empezá hoy: chat seguro, historial y reporte para el
                  consultorio.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Con tu cuenta guardás el historial y generás un resumen
                  compartible.
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-stretch sm:gap-2">
                  <Button
                    asChild
                    className="h-12 w-full min-w-0 flex-1 gap-2 rounded-full border-0 bg-primary text-sm text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 sm:h-12 sm:text-base"
                  >
                    <Link href="/chat">
                      Ir al chat
                      <MessageCircle className="size-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full min-w-0 flex-1 gap-2 rounded-full border border-white/35 bg-white/[0.04] text-sm text-white backdrop-blur-sm hover:bg-white/10 sm:h-12 sm:text-base"
                  >
                    <Link href="/login">
                      Entrar
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
                <p className="mt-4 text-center text-[0.7rem] text-white/45">
                  Educativo · Cuenta gratis
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        className="border-b border-border/40 bg-gradient-to-b from-background to-muted/30 py-12 dark:from-[#0a0f0d] dark:to-[#040807] sm:py-16"
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
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm ring-1 ring-black/5 transition hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/5 dark:backdrop-blur-sm dark:hover:border-primary/35"
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
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm ring-1 ring-black/5 transition hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/5 dark:backdrop-blur-sm dark:hover:border-primary/35"
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
              <Card className="relative border-border/80 bg-card/95 shadow-md backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
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
        className="border-b border-border/40 bg-gradient-to-b from-muted/25 to-background py-16 dark:from-[#0a0f0d] dark:to-[#050807] sm:py-20"
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
                <Card className="h-full border-border/70 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm">
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

      <section
        className="border-b border-border/40 bg-gradient-to-b from-muted/25 to-background py-16 dark:from-[#0a0f0d] dark:to-[#050807] sm:py-20"
        aria-labelledby="steps-title"
      >
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
                  <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm">
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
        className="border-t border-border/40 bg-gradient-to-b from-[var(--mc-teal-bg)]/50 to-background py-16 dark:from-primary/[0.08] dark:via-[#0a0f0d] dark:to-[#050807] sm:py-20"
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
        className="border-t border-border/40 bg-background/30 py-8 dark:border-white/10"
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
    </div>
  );
}
