import Link from "next/link";
import { MessageCircle, FileText, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Vista MVP: accesos rápidos y placeholders para medicación, síntomas y
            adherencia cuando conectes tablas reales.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="size-4 text-primary" aria-hidden />
                Chat
              </CardTitle>
              <CardDescription>RAG + herramientas FDA</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link href="/chat">Abrir</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" aria-hidden />
                Reporte
              </CardTitle>
              <CardDescription>PDF para el médico</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" asChild>
                <Link href="/report">Ver</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4" aria-hidden />
                Ingesta
              </CardTitle>
              <CardDescription>Base de conocimiento</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <code className="block truncate rounded bg-muted px-2 py-1.5 font-mono">
                npx tsx scripts/ingest-knowledge.ts
              </code>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Medicación hoy</CardTitle>
              <CardDescription>Próximo: lectura desde Supabase</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tabla sugerida:{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">
                medications
              </code>
              . Mostrá dosis, hora y check de adherencia.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Síntomas (7 días)</CardTitle>
              <CardDescription>Próximo: gráfico + tabla</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tabla sugerida:{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">symptoms</code>
              . Podés volcar resúmenes desde el chat.
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
