"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/integrations/supabase/client";
import { cn } from "@/lib/utils";

/** Mensajes claros para errores de Auth (429 rate limit, red, etc.). */
function authErrorToastMessage(
  error: { message: string; status?: number },
  context: "login" | "signup",
): string {
  const m = error.message.toLowerCase();
  const status = error.status;

  if (
    status === 429 ||
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("email rate limit")
  ) {
    return context === "signup"
      ? "Se alcanzó el límite de registros o de correos enviados (protección de Supabase). Esperá unos minutos, probá con otra red o iniciá sesión si la cuenta ya existe."
      : "Demasiados intentos. Esperá un minuto y volvé a intentar.";
  }

  if (
    m.includes("timeout") ||
    m.includes("timed out") ||
    m.includes("network") ||
    m.includes("failed to fetch")
  ) {
    return "Problema de conexión o tiempo de espera agotado. Revisá tu internet e intentá de nuevo.";
  }

  return error.message;
}

const fieldLabel = "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const inputClass =
  "h-12 rounded-xl border-border/60 bg-background/50 pl-10 pr-3 text-base shadow-sm transition-[box-shadow,background-color] placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 md:text-sm dark:bg-input/20";

export function LoginForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
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
          toast.error(authErrorToastMessage(error, "login"));
        }
        return;
      }

      toast.success("Bienvenido a MediCoach");
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
    const f = firstName.trim();
    const l = lastName.trim();
    const p = phone.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!f || !l) {
      toast.error("Ingresá nombre y apellido.");
      return;
    }
    if (!p) {
      toast.error("Ingresá un teléfono de contacto.");
      return;
    }
    const phoneDigits = p.replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      toast.error("Ingresá un teléfono válido (al menos 8 dígitos).");
      return;
    }

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
      const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
          data: {
            first_name: f,
            last_name: l,
            phone: p,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email ya está registrado. Probá iniciar sesión.");
          setActiveTab("login");
        } else {
          toast.error(authErrorToastMessage(error, "signup"));
        }
        return;
      }

      toast.success(
        "Cuenta creada. Revisá tu correo para confirmar tu email.",
      );
      setFirstName("");
      setLastName("");
      setPhone("");
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
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "login" | "signup")}
        className="w-full"
      >
        <div className="mb-6">
          <TabsList
            className="grid h-12 w-full grid-cols-2 gap-0 rounded-full border border-border/50 bg-muted/40 p-1 shadow-inner"
            variant="default"
          >
            <TabsTrigger
              value="login"
              className="h-full rounded-full text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Iniciar sesión
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="h-full rounded-full text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Crear cuenta
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="login" className="mt-0 space-y-0 outline-none">
          <form onSubmit={handleLogin} noValidate className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className={fieldLabel}
              >
                Email
              </label>
              <div className="group relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                  aria-hidden
                />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={pending}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className={fieldLabel}
                >
                  Contraseña
                </label>
              </div>
              <div className="group relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                  aria-hidden
                />
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={pending}
                  required
                  className={cn(inputClass, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  disabled={pending}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
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
              className="h-12 w-full gap-2 rounded-xl text-[15px] font-semibold shadow-md shadow-primary/20 transition-transform active:scale-[0.99]"
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-0 space-y-0 outline-none">
          <form onSubmit={handleSignup} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
                <label
                  htmlFor="signup-first"
                  className={fieldLabel}
                >
                  Nombre
                </label>
                <div className="group relative">
                  <User
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                    aria-hidden
                  />
                  <Input
                    id="signup-first"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="María"
                    disabled={pending}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-1">
                <label
                  htmlFor="signup-last"
                  className={fieldLabel}
                >
                  Apellido
                </label>
                <div className="group relative">
                  <User
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                    aria-hidden
                  />
                  <Input
                    id="signup-last"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="González"
                    disabled={pending}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="signup-phone"
                className={fieldLabel}
              >
                Teléfono
              </label>
              <div className="group relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                  aria-hidden
                />
                <Input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09X XXX XXX o +598…"
                  disabled={pending}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="signup-email"
                className={fieldLabel}
              >
                Email
              </label>
              <div className="group relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                  aria-hidden
                />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={pending}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="signup-password"
                className={fieldLabel}
              >
                Contraseña
              </label>
              <div className="group relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80 transition-colors group-focus-within:text-primary"
                  aria-hidden
                />
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  autoComplete="new-password"
                  disabled={pending}
                  required
                  className={cn(inputClass, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  disabled={pending}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Al registrarte aceptás el uso de tus datos asociado a tu perfil
              de paciente, según las políticas del servicio.
            </p>

            <Button
              className="h-12 w-full gap-2 rounded-xl text-[15px] font-semibold shadow-md shadow-primary/20 transition-transform active:scale-[0.99]"
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Creando cuenta…
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center">
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-normal text-muted-foreground"
          asChild
        >
          <Link href="/">← Volver al inicio</Link>
        </Button>
      </p>
    </div>
  );
}
