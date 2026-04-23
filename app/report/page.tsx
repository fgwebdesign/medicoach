import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reporte para el médico</h1>
          <p className="text-muted-foreground">
            PDF con <code className="font-mono">@react-pdf/renderer</code> u otra
            librería que elijas.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              Resumen de adherencia + cronología de síntomas (guía producto).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Endpoint sugerido: <code className="font-mono">GET /api/report</code>
              .
            </p>
            <Button disabled variant="secondary">
              Descargar PDF (pendiente)
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
