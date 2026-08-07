"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Number((currentProgress / scrollHeight).toFixed(3)));
      }
    };

    window.addEventListener("scroll", updateScrollCompletion, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollCompletion);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-line/20">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
        style={{ scaleX: completion, transformOrigin: "0%" }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </div>
  );
}
