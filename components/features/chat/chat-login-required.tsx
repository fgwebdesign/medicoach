import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Sustituye el panel de chat si el visitante no tiene sesión.
 */
export function ChatLoginRequired() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-2 py-8">
      <Card className="border-border/50 shadow-md">
        <CardHeader className="text-center sm:text-left">
          <div className="mb-2 flex justify-center sm:justify-start">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="size-6" aria-hidden />
            </div>
          </div>
          <CardTitle className="font-heading text-xl sm:text-2xl">
            Para usar el chat de MediCoach, necesitás una cuenta
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Así podemos guardar de forma segura lo que comentés con el asistente
            (síntomas, medicación) y ofrecerte un resumen para tu médico. Creá
            una cuenta gratis o iniciá sesión si ya tenés una.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MessageCircle
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              Preguntas sobre diabetes, presión, medicación y cómo te sentís.
            </li>
            <li className="flex gap-2">
              <MessageCircle
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              Misma identidad en el panel y en el reporte para tu equipo de
              salud.
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-stretch">
          <Button asChild className="w-full sm:flex-1" size="lg">
            <Link href="/login?next=/chat">Entrar o crear cuenta</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
