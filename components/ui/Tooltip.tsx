"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useRef } from "react";

type TooltipProps = {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  delay?: number;
};

export function Tooltip({
  content,
  position = "bottom",
  children,
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setIsVisible(false);
  };

  const handleClickOrTouch = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setIsVisible(false);
  };

  const positionClasses = {
    bottom: "top-[calc(100%+8px)] left-1/2",
    top: "bottom-[calc(100%+8px)] left-1/2",
    left: "right-[calc(100%+8px)] top-1/2",
    right: "left-[calc(100%+8px)] top-1/2"
  };

  const animations = {
    bottom: {
      initial: { opacity: 0, y: -4, x: "-50%", scale: 0.92 },
      animate: { opacity: 1, y: 0, x: "-50%", scale: 1 },
      exit: { opacity: 0, y: -4, x: "-50%", scale: 0.92 }
    },
    top: {
      initial: { opacity: 0, y: 4, x: "-50%", scale: 0.92 },
      animate: { opacity: 1, y: 0, x: "-50%", scale: 1 },
      exit: { opacity: 0, y: 4, x: "-50%", scale: 0.92 }
    },
    left: {
      initial: { opacity: 0, x: 4, y: "-50%", scale: 0.92 },
      animate: { opacity: 1, x: 0, y: "-50%", scale: 1 },
      exit: { opacity: 0, x: 4, y: "-50%", scale: 0.92 }
    },
    right: {
      initial: { opacity: 0, x: -4, y: "-50%", scale: 0.92 },
      animate: { opacity: 1, x: 0, y: "-50%", scale: 1 },
      exit: { opacity: 0, x: -4, y: "-50%", scale: 0.92 }
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClickCapture={handleClickOrTouch}
      onPointerDown={handleClickOrTouch}
    >
      {children}

      <AnimatePresence>
        {isVisible && content ? (
          <motion.div
            initial={animations[position].initial}
            animate={animations[position].animate}
            exit={animations[position].exit}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`absolute z-[100] whitespace-nowrap rounded-xl border border-line bg-surface/95 backdrop-blur-2xl px-3 py-1 text-[11px] font-black text-text shadow-xl shadow-black/20 pointer-events-none select-none ${positionClasses[position]}`}
          >
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
