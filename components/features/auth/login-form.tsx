"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/integrations/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Ingresá tu email y contraseña.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Ingresando a MediCoach...");
      // Next.js redirige automáticamente tras auth exitoso con middleware
      window.location.href = "/dashboard";
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Intentá de nuevo.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Ingresá tu email y contraseña.");
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email ya está registrado. Probá iniciar sesión.");
          setActiveTab("login");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success(
        "Cuenta creada. Revisá tu email para confirmar tu dirección.",
      );
      setEmail("");
      setPassword("");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al crear la cuenta. Intentá de nuevo.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "login" | "signup")}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
        <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-5 pt-2">
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium leading-none">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="login-email"
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
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium leading-none">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                disabled={pending}
                required
                className="h-11 pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={pending}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <Button
            className="h-11 w-full gap-2 text-base"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Ingresando…
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-5 pt-2">
        <form onSubmit={handleSignup} noValidate className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium leading-none">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="signup-email"
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
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium leading-none">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                disabled={pending}
                required
                className="h-11 pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={pending}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Al crear tu cuenta aceptás que tus datos se asocien a tu perfil de
              paciente.
            </p>
          </div>

          <Button
            className="h-11 w-full gap-2 text-base"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Creando cuenta…
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>
      </TabsContent>

      <div className="mt-4 text-center">
        <Button variant="ghost" className="h-auto text-sm" type="button" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </Tabs>
  );
}
