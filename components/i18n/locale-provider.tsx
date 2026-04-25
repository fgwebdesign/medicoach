"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDictionary, type MessageDictionary } from "@/lib/i18n/dictionary";
import { createTranslator, type I18nPath } from "@/lib/i18n/translate";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/types";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: I18nPath) => string;
  messages: MessageDictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (v === "en" || v === "es") return v;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLocaleState(readStoredLocale());
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  }, []);

  const messages = useMemo(() => getDictionary(locale), [locale]);
  const t = useMemo(() => createTranslator(messages), [messages]);

  useEffect(() => {
    if (ready) document.documentElement.lang = locale;
  }, [locale, ready]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, messages }),
    [locale, setLocale, t, messages],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const c = useContext(LocaleContext);
  if (!c) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return c;
}

/**
 * Misma API que `useLocale` pero sin error si el proveedor aún no está (no usar en producción).
 */
export function useOptionalLocale(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
