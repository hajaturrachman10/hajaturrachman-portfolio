"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, ArrowLeft, ExternalLink } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageContext";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type LocationConfirmModalProps = {
  open: boolean;
  targetName: string;
  targetUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function LocationConfirmModal({
  open,
  targetName,
  targetUrl,
  onConfirm,
  onCancel
}: LocationConfirmModalProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  useEffect(() => {
    if (!open) return;
    lockScroll();

    const preventDefault = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.classList?.contains("modal-backdrop")) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Tab") {
        const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!modal) return;
        const focusables = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);


  if (!mounted) return null;
 
  return createPortal(
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
            className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden transform-gpu will-change-[transform,opacity]"
          >

            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: {
                    scale: 1.06,
                    rotate: 6,
                    borderColor: "rgb(var(--color-primary) / 0.56)",
                    boxShadow: "0 0 18px rgb(var(--color-primary) / 0.35)",
                    transition: { type: "spring", stiffness: 450, damping: 18 }
                  },
                  press: {
                    scale: 0.94,
                    rotate: 3,
                    borderColor: "rgb(var(--color-primary) / 0.72)",
                    boxShadow: "0 0 12px rgb(var(--color-primary) / 0.5)",
                    transition: { type: "spring", stiffness: 450, damping: 18 }
                  }
                }}
                className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
              >
                <Compass className="h-7 w-7" />
              </motion.div>
              <div className="w-full">
                <h3 className="font-display text-2xl font-black">
                  {language === "id" ? "Konfirmasi Pengalihan" : "Weiterleitung bestätigen"}
                </h3>
                <p className="mt-2 text-sm font-bold leading-6 text-muted text-center">
                  {language === "id" ? (
                    <>
                      Anda akan dialihkan ke Google Maps untuk melihat lokasi <strong>{targetName}</strong>. Apakah Anda bersedia membuka tautan eksternal berikut?
                    </>
                  ) : (
                    <>
                      Sie werden zu Google Maps weitergeleitet, um den Standort <strong>{targetName}</strong> anzuzeigen. Möchten Sie diesen externen Link öffnen?
                    </>
                  )}
                </p>
                <div className="mt-4 w-full rounded-2xl bg-primary/5 border border-primary/10 p-3 text-xs font-black text-primary break-all select-all text-center">
                  {targetUrl}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 w-full">
              {/* Setujui button */}
              <MagneticButton className="w-full">
                <motion.a
                  href={targetUrl}
                  onClick={onConfirm}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.03, y: -3 },
                    press: { scale: 0.95 }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="button-primary shimmer-constant focus-ring mt-2 w-full flex items-center justify-center gap-2 border-0 select-none"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>{language === "id" ? "Buka Google Maps" : "Google Maps öffnen"}</span>
                </motion.a>
              </MagneticButton>

              {/* Batal button */}
              <MagneticButton className="w-full">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.03, y: -3 },
                    press: { scale: 0.95 }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="button-secondary-negative focus-ring w-full mt-1 flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>{language === "id" ? "Batal" : "Abbrechen"}</span>
                </motion.button>
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
