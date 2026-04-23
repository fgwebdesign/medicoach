/**
 * Rutas y metadatos de navegación principal.
 * Mantener aquí evita drift entre header, footer y sitemap.
 */
export const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/report", label: "Reporte" },
  { href: "/login", label: "Entrar" },
] as const;

export type MainNavItem = (typeof MAIN_NAV)[number];
