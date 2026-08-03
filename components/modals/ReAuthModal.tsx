"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type ReAuthModalProps = {
  open: boolean;
  title: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ReAuthModal({
  open,
  title,
  description,
  onSuccess,
  onCancel
}: ReAuthModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/re-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Kata sandi re-autentikasi salah.");
        setLoading(false);
        return;
      }

      setPassword("");
      setLoading(false);
      onSuccess();
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[140] grid place-items-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.90 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22
            }}
            className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden flex flex-col gap-4"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                whileHover={{ scale: 1.06, rotate: 6 }}
                whileTap={{ scale: 0.94, rotate: 3 }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 cursor-pointer select-none"
              >
                <ShieldAlert className="h-7 w-7 sm:h-8 sm:w-8" />
              </motion.div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-primary">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted">
                  {description}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Level 3 Sensitive Action
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              {errorMsg ? (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-500">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">
                  Masukkan Password Admin untuk Verifikasi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password admin aktif"
                    className="input focus-ring w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-surface border border-line font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <MagneticButton className="w-full">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.03, y: -3 },
                      press: { scale: 0.95 }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    className="button-primary shimmer-constant focus-ring mt-2 w-full flex items-center justify-center gap-2 border-0 select-none disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4 shrink-0" />
                    <span>{loading ? "Verifikasi..." : "Verifikasi & Eksekusi"}</span>
                  </motion.button>
                </MagneticButton>

                <MagneticButton className="w-full">
                  <motion.button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
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
                    <span>Batal</span>
                  </motion.button>
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
