"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const BAR_COUNT = 5;

function safeCloseAudioContext(
  ctx: AudioContext | null | undefined,
): void {
  if (!ctx) return;
  if (ctx.state === "closed") return;
  try {
    void ctx.close();
  } catch {
    /* InvalidStateError si ya se cerró por otra vía (race, Strict Mode) */
  }
}

type VoiceActivityMeterProps = {
  /** `true` mientras se escucha. */
  active: boolean;
  /** Flujo de mic para el analizador; sin stream se muestra pulso mínimo. */
  mediaStream: MediaStream | null;
  className?: string;
  /** Escala 0-1: altura util del contenedor. */
  maxHeightClass?: string;
};

export function VoiceActivityMeter({
  active,
  mediaStream,
  className,
  maxHeightClass = "h-5",
}: VoiceActivityMeterProps) {
  const reduce = useReducedMotion() ?? false;
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0.15),
  );
  const rafRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    if (!mediaStream) {
      /* Sin analizador: respiro sutil (permiso denegado o no disponible). */
      const t0 = performance.now();
      const idle = (now: number) => {
        if (!active) return;
        const t = (now - t0) / 1000;
        const wobble = 0.22 + 0.12 * Math.sin(t * 4.2) * Math.sin(t * 2.1);
        setLevels(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const phase = i * 0.4;
            return wobble + 0.05 * Math.sin(t * 5 + phase);
          }),
        );
        rafRef.current = requestAnimationFrame(idle);
      };
      rafRef.current = requestAnimationFrame(idle);
      return () => cancelAnimationFrame(rafRef.current);
    }

    let dead = false;
    const start = () => {
      if (dead) return;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -20;
      analyser.smoothingTimeConstant = 0.7;
      const source = ctx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      analyserRef.current = analyser;
      sourceRef.current = source;
      void ctx.resume().then(() => {
        if (dead) {
          try {
            sourceRef.current?.disconnect();
            analyserRef.current?.disconnect();
          } catch {
            /* ignore */
          }
          safeCloseAudioContext(ctx);
          return;
        }
        const data = new Uint8Array(analyser.frequencyBinCount);
        const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
        const tick = () => {
          if (dead) return;
          analyser.getByteFrequencyData(data);
          const next = Array.from({ length: BAR_COUNT }, (_, i) => {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += data[i * step + j] ?? 0;
            }
            const avg = sum / step / 255;
            return Math.min(1, 0.08 + avg * 1.35);
          });
          setLevels(next);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      });
    };
    start();

    return () => {
      dead = true;
      cancelAnimationFrame(rafRef.current);
      try {
        sourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      safeCloseAudioContext(ctxRef.current);
      sourceRef.current = null;
      analyserRef.current = null;
      ctxRef.current = null;
      setLevels(Array.from({ length: BAR_COUNT }, () => 0.12));
    };
  }, [active, mediaStream]);

  const baseH = 3;
  const rangePx = reduce ? 5 : 11;

  return (
    <div
      className={cn("flex w-full items-end justify-center gap-px", maxHeightClass, className)}
      aria-hidden
    >
      {levels.map((l, i) => {
        const h = baseH + l * rangePx;
        return (
          <motion.span
            key={`va-${i}`}
            className="w-0.5 min-h-[2px] shrink-0 rounded-sm bg-primary"
            style={{ willChange: "height" }}
            initial={false}
            animate={reduce ? { height: 8 } : { height: h }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 480, damping: 34, mass: 0.25 }
            }
          />
        );
      })}
    </div>
  );
}
