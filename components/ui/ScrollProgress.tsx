"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring physics for buttery 60/120fps scroll progress movement
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none select-none">
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-primary via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]"
        style={{ scaleX }}
      />
    </div>
  );
}
