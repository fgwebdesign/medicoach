export type Locale = "es" | "en";

export const LOCALES: readonly Locale[] = ["es", "en"] as const;

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_STORAGE_KEY = "medicoach_locale_v1";
