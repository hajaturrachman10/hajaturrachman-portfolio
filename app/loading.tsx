"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas/60 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing orb background */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-28 w-28 rounded-full bg-primary/10 blur-xl"
        />

        {/* Outer spinning dashed ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-20 w-20 rounded-full border-2 border-dashed border-primary/25"
        />

        {/* Middle spinning gradient indicator */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-14 w-14 rounded-full border-2 border-t-secondary border-r-transparent border-b-transparent border-l-transparent"
        />

        {/* Inner solid glowing core */}
        <motion.div
          animate={{
            scale: [0.85, 1.05, 0.85],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-7 w-7 rounded-full bg-gradient-to-tr from-primary via-secondary to-accent shadow-glow"
        />
      </div>

      {/* Dynamic page loading text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8 text-center"
      >
        <span className="block font-display text-sm font-black tracking-[0.25em] uppercase text-primary/80 animate-pulse">
          Memuat Halaman
        </span>
        <span className="block mt-1.5 text-[10px] font-bold text-muted uppercase tracking-[0.15em]">
          Mohon Tunggu Sebentar
        </span>
      </motion.div>
    </div>
  );
}
