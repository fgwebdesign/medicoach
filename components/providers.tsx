"use client";

import * as React from "react";
import { ThemeProvider } from "@teispace/next-themes";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/components/i18n/locale-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storage="local"
      disableTransitionOnChange
    >
      <LocaleProvider>
        {children}
        <Toaster richColors position="top-center" />
      </LocaleProvider>
    </ThemeProvider>
  );
}
