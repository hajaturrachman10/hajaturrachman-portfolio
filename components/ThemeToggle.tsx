"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-11 w-11 rounded-full border border-line bg-surface/90"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    const doc = document as any;

    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    doc.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
      onClick={toggleTheme}
      className="focus-ring group relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-line bg-surface/90 text-text shadow-sm backdrop-blur-xl transition-colors duration-300 hover:border-primary/60 cursor-pointer select-none"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-primary/12 via-secondary/10 to-accent/12 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className="relative"
      >
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.span>
    </motion.button>
  );
}
