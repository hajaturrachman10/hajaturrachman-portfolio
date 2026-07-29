"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSiteData } from "@/data/site";

export function PageRestoreOverlay() {
  const { siteConfig } = useSiteData();
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // Hide overlay smoothly after scroll restoration and layout paint settle
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showOverlay ? (
        <motion.div
          key="page-restore-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] grid place-items-center bg-canvas backdrop-blur-3xl select-none pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 text-center px-6"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping blur-md" />
              <div className="icon-orbit grid h-14 w-14 place-items-center rounded-3xl border border-primary/30 bg-primary/10 text-primary shadow-glow shadow-primary/20">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="font-display text-lg font-black tracking-tight gradient-text">
                {siteConfig.name}
              </span>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
