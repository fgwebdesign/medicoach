import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-medium text-muted-foreground">
            Next.js + shadcn/ui + Supabase
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            MediCoach — base del proyecto
          </h1>
          <p className="text-pretty text-muted-foreground">
            UI con{" "}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="https://v0.dev"
              target="_blank"
              rel="noreferrer"
            >
              v0
            </a>
            , componentes en este repo (shadcn), datos en Supabase. Conectá el
            agente (LangGraph + AI SDK) en <code className="font-mono text-sm">/api/chat</code>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/chat">Abrir chat</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Próximos pasos</CardTitle>
            <CardDescription>
              Checklist rápido para la hackathon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Copiá <code className="font-mono">.env.example</code> a{" "}
                <code className="font-mono">.env.local</code> y completá Supabase
                + APIs.
              </li>
              <li>
                Ejecutá el SQL en{" "}
                <code className="font-mono">supabase/schema.sql</code> en el SQL
                Editor del proyecto.
              </li>
              <li>
                Generá pantallas en v0 y pegá el código en{" "}
                <code className="font-mono">components/</code> o{" "}
                <code className="font-mono">app/</code>.
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
