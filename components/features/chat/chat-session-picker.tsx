"use client";

import { ChevronDown, History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Row = { id: string; updated_at: string; preview: string };

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
  /** Refresco externo, ej. luego de “Nueva charla” */
  refreshKey: number;
  busy: boolean;
  label: string;
  emptyLabel: string;
};

/**
 * Listado de charlas guardadas en `chat_sessions` (sólo con sesión de usuario).
 */
export function ChatSessionPicker({
  activeId,
  onSelect,
  refreshKey,
  busy,
  label,
  emptyLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/chat/sessions", { cache: "no-store" });
      if (!r.ok) {
        setRows([]);
        return;
      }
      const j = (await r.json()) as { sessions: Row[] };
      setRows(j.sessions ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // Evitar setState síncrono dentro del effect (regla react-hooks/set-state-in-effect)
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [open, load, refreshKey]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-8 max-w-full shrink-0 gap-0.5 rounded-full px-2.5 text-[10px] sm:gap-1 sm:px-2.5 sm:text-xs"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <History className="size-3.5 sm:size-3.5" aria-hidden />
        <span className="max-[320px]:sr-only">{label}</span>
        <ChevronDown
          className={cn("size-3 opacity-70 transition", open && "rotate-180")}
          aria-hidden
        />
      </Button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div
            className="border-border/60 bg-card absolute right-0 top-full z-50 mt-1.5 w-[min(20rem,85vw)] overflow-hidden rounded-xl border shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            role="listbox"
          >
            {loading && !rows ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">Cargando…</p>
            ) : !rows || rows.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
              <ScrollArea className="max-h-56">
                <ul className="py-1">
                  {rows.map((s) => {
                    const active = s.id === activeId;
                    const d = new Date(s.updated_at);
                    const sub = d.toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <li key={s.id} role="option" aria-selected={active}>
                        <button
                          type="button"
                          className={cn(
                            "w-full border-l-2 border-transparent px-3 py-2 text-left text-sm transition",
                            active
                              ? "border-l-primary bg-primary/8"
                              : "hover:bg-muted/50",
                          )}
                          onClick={() => {
                            onSelect(s.id);
                            setOpen(false);
                          }}
                        >
                          <span className="line-clamp-2 text-foreground">
                            {s.preview}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[11px]">
                            {sub}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </>
      )}
    </div>
  );
}
