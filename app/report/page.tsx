import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Reporte para el médico
          </h1>
          <p className="text-muted-foreground">
            Resumen de adherencia y síntomas para compartir en consulta (PDF en
            roadmap).
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              Endpoint sugerido:{" "}
              <code className="font-mono text-xs">GET /api/report</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Mientras tanto, el historial útil está en{" "}
              <Link
                href="/chat"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Chat
              </Link>{" "}
              y en Supabase{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">
                chat_sessions
              </code>{" "}
              si el usuario está autenticado.
            </p>
            <Button disabled variant="secondary" className="w-full sm:w-auto">
              Descargar PDF (pendiente)
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
