import { Sparkles, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { MediChat } from "@/components/features/chat/medichat";
import { Badge } from "@/components/ui/badge";
import { aiGatewayEnabled } from "@/lib/medicoach/ai/env";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const gateway = aiGatewayEnabled();
  const hasDirectKey =
    Boolean(process.env.ANTHROPIC_API_KEY?.trim()) ||
    Boolean(process.env.OPENAI_API_KEY?.trim());
  const modelHint =
    process.env.AI_GATEWAY_CHAT_MODEL?.trim() || "por defecto (resolveChatModel)";

  return (
    <>
      <SiteHeader />
      <main
        className={cn(
          "mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:py-8",
          "bg-gradient-to-b from-primary/[0.03] via-background to-background",
        )}
      >
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Stethoscope
                  className="size-7 text-primary sm:size-8"
                  aria-hidden
                />
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  Conversar con MediCoach
                </h1>
                <Badge variant="secondary" className="font-normal">
                  Asistente de salud
                </Badge>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Podés contar cómo te sentís, preguntar por medicación o marcar
                síntomas. El asistente usa <strong>openFDA</strong> para
                referencias oficiales, una{" "}
                <strong>base de conocimiento curada</strong> (diabetes e
                hipertensión) y, si iniciás sesión, guarda en{" "}
                <strong>Supabase</strong> el historial útil.
              </p>
            </div>
            <div
              className="flex shrink-0 flex-col gap-2 sm:items-end sm:text-right"
              role="status"
            >
              {gateway ? (
                <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-200">
                  <Sparkles className="size-3.5" aria-hidden />
                  Vercel AI Gateway
                </Badge>
              ) : hasDirectKey ? (
                <Badge variant="outline" className="font-normal text-amber-800 dark:text-amber-200">
                  Modelo: proveedor directo
                </Badge>
              ) : (
                <Badge variant="destructive">Falta configurar el modelo (env)</Badge>
              )}
              <p className="text-xs text-muted-foreground sm:max-w-[14rem]">
                {gateway
                  ? `Modelo: ${modelHint}`
                  : "Para producción conviene AI Gateway o claves con cuota bajo control."}
              </p>
            </div>
          </div>
        </div>
        <MediChat />
      </main>
    </>
  );
}
