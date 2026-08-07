"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  confirmButtonClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ya, Kunci Sesi",
  cancelLabel = "Batal",
  icon: Icon = LockKeyhole,
  iconClassName = "border-line bg-primary/10 text-primary",
  confirmButtonClassName = "button-primary",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  // Lock body scroll when confirm modal is open
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[120] grid place-items-center px-4 py-8 transform-gpu will-change-[opacity]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.93 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 26
            }}
            onClick={(e) => e.stopPropagation()}
            className="premium-card w-full max-w-md rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-line bg-surface shadow-2xl relative flex flex-col gap-6 transform-gpu will-change-[transform,opacity]"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: {
                    scale: 1.06,
                    rotate: 6,
                    transition: { type: "spring", stiffness: 450, damping: 18 }
                  },
                  press: {
                    scale: 0.94,
                    rotate: 3,
                    transition: { type: "spring", stiffness: 450, damping: 18 }
                  }
                }}
                className={cn(
                  "icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border cursor-pointer select-none",
                  iconClassName
                )}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
              <div className="w-full">
                <h3 className="font-display text-xl sm:text-2xl font-black">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 w-full">
              <MagneticButton className="w-full">
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.02, y: -2 },
                    press: { scale: 0.97 }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className={cn(
                    "focus-ring w-full py-3 text-sm font-black flex items-center justify-center gap-2 border-0 cursor-pointer select-none rounded-2xl",
                    confirmButtonClassName
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{confirmLabel}</span>
                </motion.button>
              </MagneticButton>
              
              <MagneticButton className="w-full">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.02, y: -2 },
                    press: { scale: 0.97 }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="button-secondary-negative focus-ring w-full py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>{cancelLabel}</span>
                </motion.button>
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
