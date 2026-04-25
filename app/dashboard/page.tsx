import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageCircle,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketingPageMain } from "@/components/layout/marketing-page-main";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/integrations/supabase/server";
import { detectPatternsWithClient } from "@/lib/medicoach/patterns";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const weekAgo = new Date(
    new Date().getTime() - 7 * DAY_MS,
  ).toISOString();

  const [profileRes, medsRes, symptomsRes, alerts] = await Promise.all([
    supabase
      .from("patient_profiles")
      .select(
        "display_name, first_name, last_name, phone, conditions, created_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("medications")
      .select("id, name, dose, frequency, active, created_at")
      .eq("patient_id", user.id)
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase
      .from("symptoms")
      .select("id, symptom, severity, note, recorded_at")
      .eq("patient_id", user.id)
      .gte("recorded_at", weekAgo)
      .order("recorded_at", { ascending: false }),
    detectPatternsWithClient(supabase, user.id, 5, 3),
  ]);

  const profile = profileRes.data;
  const medications = medsRes.data ?? [];
  const symptomsWeek = symptomsRes.data ?? [];

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "Paciente";

  return (
    <>
      <SiteHeader />
      <MarketingPageMain>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Tu panel
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Hola, {displayName}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Resumen de medicación, síntomas recientes y alertas. Los síntomas
              podés registrarlos desde el chat; la lista de medicación se muestra
              cuando haya datos cargados en tu cuenta.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2 rounded-xl shadow-md shadow-primary/15">
            <Link href="/chat">
              Hablar con MediCoach
              <MessageCircle className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {alerts.length > 0 ? (
          <Card className="border-amber-500/40 bg-amber-500/[0.07] dark:bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-950 dark:text-amber-100">
                <AlertTriangle
                  className="size-5 text-amber-600 dark:text-amber-400"
                  aria-hidden
                />
                Patrones a tener en cuenta
              </CardTitle>
              <CardDescription className="text-amber-900/80 dark:text-amber-100/80">
                Repetición de síntomas en los últimos días. Comentá con tu
                médico si persiste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {alerts.map((a) => (
                  <li
                    key={a.sintoma}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2 dark:bg-background/20"
                  >
                    <span className="font-medium capitalize">{a.sintoma}</span>
                    <span className="text-muted-foreground">
                      {a.count} veces · severidad media{" "}
                      {a.severidadPromedio.toFixed(1)}/10
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/20 bg-primary/[0.04] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="size-4 text-primary" aria-hidden />
                Chat
              </CardTitle>
              <CardDescription>Consultas y registro de síntomas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="rounded-lg" asChild>
                <Link href="/chat">Abrir chat</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" aria-hidden />
                Reporte
              </CardTitle>
              <CardDescription>Resumen para tu consulta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="rounded-lg" asChild>
                <Link href="/report">Ver reporte</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="size-4" aria-hidden />
                Contacto
              </CardTitle>
              <CardDescription>Datos del perfil</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {profile?.phone ? (
                <p>Tel: {profile.phone}</p>
              ) : (
                <p>Podés completar el teléfono en una futura edición de perfil.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-lg">Medicación activa</CardTitle>
                <Badge variant="secondary" className="font-normal">
                  {medications.length} ítem{medications.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <CardDescription>
                Lo que figure en tu registro (nombre, dosis, frecuencia). Hoy
                el chat agrega <strong className="text-foreground/90">síntomas</strong>
                a tu historial; la medicación en esta lista aún se carga por otros
                medios o datos previos, no se guarda sola al hablar con el
                asistente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay medicación en tu registro. Es el lugar donde
                  verás lo que el médico te indicó, cuando conste en el sistema.{" "}
                  <span className="text-foreground/85">
                    Desde el chat podés anotar síntomas; si querés que también se
                    guarden las pastillas que te recetaron, sería un próximo paso
                    de producto.
                  </span>
                </p>
              ) : (
                <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {medications.map((m) => (
                    <li
                      key={m.id}
                      className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Pill className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-tight">{m.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[m.dose, m.frequency].filter(Boolean).join(" · ") ||
                            "Sin dosis indicada en el registro"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-lg">
                  Síntomas (7 días)
                </CardTitle>
                <Badge variant="outline" className="font-normal">
                  {symptomsWeek.length} registro{symptomsWeek.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <CardDescription>
                Incluye lo que venga del chat o lo que agregués manualmente en el
                futuro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {symptomsWeek.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nada registrado en la última semana. Un buen momento para
                  anotar cómo te sentiste.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {symptomsWeek.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-border/50 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium capitalize">
                          {s.symptom}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(s.recorded_at).toLocaleDateString("es-UY", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="w-10 text-xs text-muted-foreground">
                          {s.severity}/10
                        </span>
                        <Progress
                          className="h-2 flex-1"
                          value={s.severity * 10}
                        />
                      </div>
                      {s.note ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {s.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {profile?.conditions && profile.conditions.length > 0 ? (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.conditions.map((c: string) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.08] to-transparent p-6 dark:from-primary/10 dark:via-card/20 dark:to-transparent sm:flex-row sm:px-8">
          <div className="flex items-start gap-3 text-center sm:text-left">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-heading font-semibold text-foreground">Próximo paso</p>
              <p className="text-sm text-muted-foreground">
                Llevá un resumen claro a tu consulta o seguí conversando con
                MediCoach.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="secondary"
            className="gap-2 rounded-xl border border-border/60 bg-card text-foreground shadow-sm hover:bg-muted dark:border-white/10 dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
          >
            <Link href="/report">
              Generar / ver reporte
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
        </div>
      </MarketingPageMain>
    </>
  );
}
