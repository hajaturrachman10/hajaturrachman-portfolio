"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Link, ArrowLeft } from "lucide-react";

import { useLanguage } from "@/components/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";
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

    window.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      unlockScroll();
      window.removeEventListener("touchmove", preventDefault);
    };
  }, [open]);

  if (!mounted) return null;
 
  return createPortal(
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
                  className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                >
                  <Compass className="h-6 w-6" />
                </motion.div>
              </MagneticButton>
              <div className="w-full">
                <h3 className="font-display text-xl font-black">
                  {language === "id" ? "Konfirmasi Pengalihan" : "Weiterleitung bestätigen"}
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-muted text-center">
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
              {/* Setujui button: solid primary/green anchor link */}
              <MagneticButton className="w-full">
                <motion.a
                  href={targetUrl}
                  onClick={onConfirm}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: {
                      scale: 1.03,
                      y: -3,
                      filter: "brightness(1.08)",
                      boxShadow: "0 10px 20px rgb(var(--color-primary) / 0.3)"
                    },
                    press: {
                      scale: 0.95,
                      y: 1,
                      filter: "brightness(0.92)",
                      boxShadow: "0 4px 6px rgb(var(--color-primary) / 0.1)"
                    }
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 12 }}
                  className="button-primary shimmer-constant focus-ring flex items-center justify-center gap-2 py-3.5 text-sm border-0 w-full"
                >
                  <motion.span
                    variants={{
                      hover: { x: 4, rotate: 15 },
                      press: { x: 1, rotate: 0 }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 10 }}
                    className="inline-flex items-center"
                  >
                    <Link className="h-4 w-4" />
                  </motion.span>
                  {language === "id" ? "Setujui" : "Zustimmen"}
                </motion.a>
              </MagneticButton>
              
              {/* Kembali button: bordered primary outline */}
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
                  className="button-secondary focus-ring w-full flex items-center justify-center gap-2.5 py-3.5 text-sm font-black transition-all duration-300 cursor-pointer select-none shadow-sm border border-line bg-surface text-primary"
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
                  {language === "id" ? "Kembali" : "Zurück"}
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
