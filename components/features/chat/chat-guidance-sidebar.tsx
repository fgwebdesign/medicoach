import { FileText, HeartHandshake, Pill, Shield } from "lucide-react";

/**
 * Panel lateral orientado a personas: sin términos técnicos ni modelo.
 */
export function ChatGuidanceSidebar() {
  return (
    <aside
      className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-card/50 p-5 shadow-sm backdrop-blur-sm lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start"
      aria-label="Guía de uso del chat"
    >
      <div>
        <h2 className="font-heading text-lg font-semibold leading-snug text-foreground">
          Tu espacio de conversación
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Hablá con naturalidad: contá cómo te sentís, qué pastillas tomás o qué
          dudas tenés. El asistente está pensado para diabetes e hipertensión.
        </p>
      </div>

      <ul className="space-y-3.5 text-sm">
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HeartHandshake className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">Síntomas y bienestar</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Describí mareos, cansancio o cambios, sin apuro.
            </p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Pill className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">Medicación</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Contá dosis o nombres tal como te dijeron; el asistente responde
              con guías y etiquetas, no reemplaza al médico.
            </p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">Resumen para el médico</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Pedí un resumen cuando vayas a la consulta.
            </p>
          </div>
        </li>
      </ul>

      <p className="flex gap-2 border-t border-border/40 pt-4 text-xs leading-relaxed text-muted-foreground">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-primary/80" aria-hidden />
        <span>
          La conversación queda vinculada a tu cuenta de forma segura, para que
          podamos armar un historial útil. Esto no reemplaza al médico; ante
          emergencia llamá a emergencias.
        </span>
      </p>
    </aside>
  );
}
