import Link from "next/link";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { LoginForm } from "@/components/features/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const err = q.error ? decodeURIComponent(q.error) : undefined;
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col lg:grid lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-b border-border/60 bg-gradient-to-br from-[var(--mc-teal-bg)] via-background to-primary/[0.07] px-10 py-12 lg:flex lg:border-b-0 lg:border-r dark:from-primary/[0.12] dark:via-card dark:to-background">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-[380px] rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.18]"
            aria-hidden
          />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur dark:bg-card/80">
              <Activity className="size-3.5" aria-hidden />
              MediCoach
            </div>
            <h1 className="font-heading max-w-md text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">
              Tu seguimiento clínico, con calma
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Accedé con tu email y contraseña. Tus datos quedan seguros y solo
              vos los podés ver: pensado para quien hace seguimiento de su salud
              día a día.
            </p>
          </div>
          <ul className="relative z-10 mt-12 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="size-4" aria-hidden />
              </span>
              <span>
                <strong className="font-medium text-foreground">
                  Tu información, organizada
                </strong>
                <br />
                Al entrar, creamos tu espacio personal para medicación,
                síntomas y conversaciones con MediCoach.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" aria-hidden />
              </span>
              <span>
                <strong className="font-medium text-foreground">
                  Privacidad ante todo
                </strong>
                <br />
                Solo vos accedés a tu historial: medicación, síntomas y chats
                quedan vinculados a tu cuenta.
              </span>
            </li>
          </ul>
        </section>

        <section className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-1 lg:hidden">
              <Badge variant="outline" className="mb-2 font-normal">
                MediCoach
              </Badge>
              <p className="font-heading text-xl font-semibold tracking-tight">
                Entrá con tu email
              </p>
              <p className="text-sm text-muted-foreground">
                Ingresá o creá tu cuenta para empezar.
              </p>
            </div>

            <Card className="border-border/80 shadow-md shadow-primary/5">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="font-heading text-2xl tracking-tight lg:text-[1.65rem]">
                  Entrar a MediCoach
                </CardTitle>
                <CardDescription className="text-pretty text-sm leading-relaxed">
                  Si es tu primera vez, creá tu cuenta en la pestaña "Crear
                  cuenta". Ya tenés usuario? Usá "Iniciar sesión".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!supabaseReady ? (
                  <div
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-950 dark:text-amber-100"
                    role="alert"
                  >
                    {process.env.NODE_ENV === "development" ? (
                      <>
                        Falta configuración en el servidor: revisá{" "}
                        <code className="rounded bg-muted px-1 font-mono text-xs">
                          .env.local
                        </code>{" "}
                        (URL y clave pública del proyecto) y reiniciá{" "}
                        <code className="font-mono text-xs">npm run dev</code>.
                      </>
                    ) : (
                      <>
                        El inicio de sesión no está disponible por ahora.
                        Volvé a intentar más tarde o escribinos si el problema
                        continúa.
                      </>
                    )}
                  </div>
                ) : null}
                {err ? (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {err}
                  </div>
                ) : null}
                <LoginForm />
              </CardContent>
            </Card>

            <Separator className="opacity-60" />

            <div className="flex flex-col items-center gap-2 text-center">
              <Button variant="link" className="h-auto text-sm text-muted-foreground" asChild>
                <Link href="/chat">Continuar sin cuenta (solo chat)</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
