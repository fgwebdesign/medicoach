import { cn } from "@/lib/utils";

type MarketingPageMainProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Fondo de app/marketing: mint en light, bosque + halos en dark.
 * Antes forzaba #050a08 en ambos modos y las cards (light) quedaban blancas encima.
 */
export function MarketingPageMain({ children, className }: MarketingPageMainProps) {
  return (
    <main
      className={cn(
        "relative z-0 flex min-h-0 flex-1 flex-col",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[#eef5f0] dark:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[#050a08] dark:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,oklch(0.72_0.07_175/0.32),transparent_55%)] dark:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_50%_at_100%_100%,oklch(0.7_0.05_175/0.22),transparent_52%)] dark:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,oklch(0.4_0.1_175/0.2),transparent_55%)] dark:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_55%_45%_at_100%_100%,oklch(0.32_0.07_175/0.14),transparent_50%)] dark:block"
        aria-hidden
      />
      {children}
    </main>
  );
}
