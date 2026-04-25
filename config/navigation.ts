/**
 * Rutas y metadatos de navegación principal.
 * Las etiquetas visibles se resuelven con i18n en el header (`nav.<key>`).
 */
export const MAIN_NAV = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/chat", key: "chat" },
  { href: "/report", key: "report" },
] as const;

export type MainNavItem = (typeof MAIN_NAV)[number];
