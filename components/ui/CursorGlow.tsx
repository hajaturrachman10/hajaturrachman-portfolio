"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springX = useSpring(mouseX, { stiffness: 130, damping: 24, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 130, damping: 24, mass: 0.4 });

  useEffect(() => {
    setMounted(true);

    function handleMouseMove(event: MouseEvent) {
      mouseX.set(event.clientX - 180);
      mouseY.set(event.clientY - 180);
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[60] hidden h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl md:block"
      style={{ x: springX, y: springY }}
    />
  );
}
