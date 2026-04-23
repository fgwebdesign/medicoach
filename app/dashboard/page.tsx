import { SiteHeader } from "@/components/layout/site-header";
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
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Reemplazá este placeholder con el layout del PDF (timeline, gráfica,
            adherencia).
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Medicación hoy</CardTitle>
              <CardDescription>v0: prompt “Medication Timeline”</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Conectá lectura/escritura a Supabase (
              <code className="font-mono">medications</code>).
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Síntomas (7 días)</CardTitle>
              <CardDescription>recharts + datos seed</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tabla <code className="font-mono">symptoms</code> + gráfico en
              cliente.
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
