"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ya, kunci",
  cancelLabel = "Batal",
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
          className="modal-backdrop fixed inset-0 z-[120] grid place-items-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 35, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.90 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22
            }}
            className="premium-card w-full max-w-md rounded-3xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-line bg-surface"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <MagneticButton>
                <motion.div
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: {
                      scale: 1.08,
                      rotate: 6,
                      borderColor: "rgb(var(--color-primary) / 0.56)",
                      boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)",
                      transition: { type: "spring", stiffness: 450, damping: 18 }
                    },
                    press: {
                      scale: 0.88,
                      rotate: 6,
                      borderColor: "rgb(var(--color-primary) / 0.72)",
                      boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)",
                      transition: { type: "spring", stiffness: 450, damping: 18 }
                    }
                  }}
                  className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                >
                  <LockKeyhole className="h-6 w-6" />
                </motion.div>
              </MagneticButton>
              <div className="w-full">
                <h3 className="font-display text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-muted">
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
                    hover: {
                      scale: 1.03,
                      y: -3,
                      backgroundColor: "#e11d48", // Rose 600 hover background
                      boxShadow: "0 10px 20px rgba(225, 29, 72, 0.3)"
                    },
                    press: {
                      scale: 0.95,
                      y: 1,
                      backgroundColor: "#be123c", // Rose 700 active background
                      boxShadow: "0 4px 6px rgba(225, 29, 72, 0.1)"
                    }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="rounded-2xl bg-rose-600 text-white font-black px-5 py-3.5 text-sm w-full cursor-pointer select-none shadow-md shadow-rose-600/20 border-0 flex items-center justify-center gap-2"
                >
                  <motion.span
                    variants={{
                      hover: { scale: 1.25, rotate: -10 },
                      press: { scale: 0.85, rotate: 0 }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 10 }}
                    className="inline-flex items-center"
                  >
                    <LockKeyhole className="h-4 w-4" />
                  </motion.span>
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
                    hover: {
                      scale: 1.03,
                      y: -3,
                      borderColor: "rgba(var(--color-primary), 0.5)",
                      backgroundColor: "rgba(var(--color-primary), 0.08)",
                      boxShadow: "0 8px 16px rgba(var(--color-primary), 0.15)"
                    },
                    press: {
                      scale: 0.95,
                      y: 1,
                      borderColor: "rgb(var(--color-primary))",
                      backgroundColor: "rgba(var(--color-primary), 0.25)",
                      boxShadow: "0 2px 4px rgba(var(--color-primary), 0.05)"
                    }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="flex items-center justify-center gap-2.5 rounded-2xl border border-line bg-surface text-primary px-5 py-3.5 text-sm font-black transition-all duration-300 cursor-pointer select-none shadow-sm w-full"
                >
                  <motion.span
                    variants={{
                      hover: { x: -4 },
                      press: { x: -1 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    className="inline-flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.span>
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
