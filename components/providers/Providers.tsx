"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./LanguageContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={true}
      >
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
}
