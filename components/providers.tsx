"use client";

import * as React from "react";
import { ThemeProvider } from "@teispace/next-themes";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storage="local"
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
