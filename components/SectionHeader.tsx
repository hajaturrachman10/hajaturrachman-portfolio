"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LocationBadges } from "./LocationBadges";
import { MagneticButton } from "./MagneticButton";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  showLocations?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  showLocations = false
}: SectionHeaderProps) {
  return (
    <div
      className={
        centered
          ? "mx-auto mb-5 sm:mb-8 lg:mb-10 max-w-3xl text-center flex flex-col items-center"
          : "mb-5 sm:mb-8 lg:mb-10 max-w-3xl flex flex-col items-start"
      }
    >
      <motion.div
        whileHover="hover"
        whileTap="press"
        variants={{
          hover: { 
            scale: 1.05, 
            y: -1,
            boxShadow: "0 4px 12px rgb(var(--color-primary-rgb) / 0.12)",
            borderColor: "rgb(var(--color-primary-rgb) / 0.45)"
          },
          press: { 
            scale: 0.95,
            y: 0,
            boxShadow: "0 2px 6px rgb(var(--color-primary-rgb) / 0.08)"
          }
        }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        className="eyebrow cursor-pointer select-none shrink-0"
      >
        <motion.span
          variants={{
            hover: { rotate: 180, scale: 1.15 },
            press: { rotate: 90, scale: 0.9 }
          }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="inline-flex items-center text-primary"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
        </motion.span>
        <span>{eyebrow}</span>
      </motion.div>
      <h2 className="section-title mt-3 sm:mt-5">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base sm:leading-8 sm:mt-4">
          {description}
        </p>
      ) : null}
      {showLocations && (
        <div className={centered ? "flex justify-center" : ""}>
          <LocationBadges />
        </div>
      )}
    </div>
  );
}
