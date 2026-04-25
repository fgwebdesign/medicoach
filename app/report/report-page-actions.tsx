"use client";

import { Check, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReportPdfSheet } from "@/components/features/report/report-pdf-sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = { isLoggedIn: boolean };

/**
 * CTA + panel con timeline. La sesión se valida en el servidor; sin login vemos CTA a login.
 */
export function ReportPageActions({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);

  return (
    <>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Reporte para el médico
        </h1>
        <p className="text-muted-foreground">
          {isLoggedIn
            ? "Generá un PDF listo para compartir en consulta con lo que tenés guardado en MediCoach."
            : "Iniciá sesión y generá un resumen con tus datos reales de la app."}
        </p>
      </div>

      {isLoggedIn ? (
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Qué va a decir el reporte</CardTitle>
            <CardDescription>
              Vas a ver un paso a paso al generar. Podés abrirlo también desde el chat (arriba a la
              derecha, “Reporte PDF”).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                "Perfil: nombre y condiciones referidas, si las cargaste",
                "Síntomas de los últimos 14 días (app o registro vía charla)",
                "Medicación activa en la cuenta",
                "Texto de la charla con el asistente más reciente en el servidor",
              ].map((line) => (
                <li key={line} className="flex gap-2 text-sm">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                    aria-hidden
                  >
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="leading-snug text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Generar reporte</CardTitle>
          <CardDescription>
            {isLoggedIn
              ? "Se abre un panel a la derecha con el progreso y baja el PDF a tu dispositivo."
              : "Iniciá sesión para acceder a tus datos reales y generar el PDF."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!isLoggedIn ? (
            <>
              <p className="text-sm text-muted-foreground">
                El resumen se arma con perfil, medicación, síntomas y charla guardada en la cuenta.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/login?next=/report">Iniciar sesión</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Seguís sumando notas en{" "}
                <Link
                  href="/chat"
                  prefetch={false}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Chat
                </Link>
                ; cada descarga toma un snapshot actual.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  className="gap-2"
                  size="lg"
                  onClick={() => {
                    setOpen(true);
                    setNonce((n) => n + 1);
                  }}
                >
                  <FileText className="size-4" aria-hidden />
                  Generar reporte PDF
                </Button>
                <p className="text-xs text-muted-foreground">
                  <code className="font-mono">MediCoach-reporte-AAAA-MM-DD.pdf</code>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isLoggedIn ? (
        <ReportPdfSheet
          open={open}
          onOpenChange={setOpen}
          autoStartNonce={nonce}
        />
      ) : null}
    </>
  );
}
