"use client";

import type { ReactNode } from "react";
import { CursorGlow } from "@/components/ui/CursorGlow";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <CursorGlow />
      {children}
    </>
  );
}
