"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/integrations/supabase/client";

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "")
  );
}

async function sendMagicLink(email: string) {
  const supabase = createClient();
  const site = siteOrigin();
  if (!site) {
    throw new Error("No se pudo resolver el origen del sitio.");
  }
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submitMagicLink(targetEmail: string) {
    const trimmed = targetEmail.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Ingresá tu email.");
      return;
    }
    setPending(true);
    try {
      const { error } = await sendMagicLink(trimmed);
      if (error) {
        toast.error(error.message);
        return;
      }
      setSentTo(trimmed);
      toast.success("Enlace enviado. Revisá tu correo.");
    } catch (err) {
      const dev =
        typeof process !== "undefined" &&
        process.env.NODE_ENV === "development";
      const msg =
        err instanceof Error
          ? dev
            ? err.message
            : "No pudimos enviar el enlace. Revisá tu conexión e intentá de nuevo."
          : "No pudimos enviar el enlace. Intentá de nuevo en unos minutos.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitMagicLink(email);
  }

  if (sentTo) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-5 text-center dark:border-primary/30 dark:bg-primary/10"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Mail className="size-6" aria-hidden />
          </div>
          <p className="font-heading text-lg font-semibold tracking-tight">
            Revisá tu bandeja
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos un enlace a{" "}
            <span className="font-medium text-foreground">{sentTo}</span>.
            Al abrirlo vas a entrar a MediCoach; podés cerrar esta pestaña.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => void submitMagicLink(sentTo)}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Reenviando…
              </>
            ) : (
              "Reenviar enlace"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => {
              setSentTo(null);
              setEmail(sentTo);
            }}
          >
            Usar otro email
          </Button>
        </div>
        <Button variant="ghost" className="w-full" type="button" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          <Sparkles className="size-3" aria-hidden />
          Sin contraseña
        </Badge>
        <span className="text-xs text-muted-foreground">
          Un solo clic desde tu email
        </span>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            required
            className="h-11 pl-9"
          />
        </div>
        <p id="email-hint" className="text-xs text-muted-foreground">
          La primera vez que entrás creamos tu cuenta automáticamente. Tus datos
          quedan asociados solo a vos.
        </p>
      </div>
      <Button className="h-11 w-full gap-2 text-base" type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando enlace…
          </>
        ) : (
          <>
            <Mail className="size-4" aria-hidden />
            Enviar enlace mágico
          </>
        )}
      </Button>
      <Button variant="ghost" className="w-full" type="button" asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </form>
  );
}
