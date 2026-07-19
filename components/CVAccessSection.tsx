"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, LockKeyhole, ShieldCheck, Sparkles, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MagneticButton } from "@/components/MagneticButton";
import { PasswordModal } from "@/components/PasswordModal";
import { useSiteData, useLanguageSelector } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

export function CVAccessSection() {
  const { cvAccess } = useSiteData();
  const { language } = useLanguage();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRememberSession(localStorage.getItem("remember_session_cv") === "true");
    }
  }, []);
  
  // Interactive PDF Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/status");
        if (response.ok) {
          const data = await response.json();
          if (data.cvUnlocked) {
            const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_cv") === "true";
            if (!remember) {
              // Sesi aktif di server tapi tidak dipilih untuk diingat -> Tampilkan animasi mengunci!
              setIsLocking(true);
              setCheckingAuth(false);
              try {
                await fetch("/api/auth/lock", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ type: "cv" }),
                });
              } catch (e) {
                console.error(e);
              }
              await new Promise((resolve) => setTimeout(resolve, 1800));
              setUnlocked(false);
              setIsLocking(false);
            } else {
              // Sesi diingat -> Tampilkan animasi memulihkan sesi!
              setIsUnlocking(true);
              setCheckingAuth(false);
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setUnlocked(true);
              setIsUnlocking(false);
            }
          } else {
            setUnlocked(false);
            setCheckingAuth(false);
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa status login:", err);
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Lock body scroll when CV PDF viewer is opened
  useEffect(() => {
    if (!viewerOpen) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [viewerOpen]);

  function downloadCv() {
    const link = document.createElement("a");
    link.href = "/api/cv/view?download=true";
    link.download = "CV-Hajaturrachman.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleLockConfirm() {
    setConfirmLock(false);
    setIsLocking(true);
    try {
      const response = await fetch("/api/auth/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "cv" }),
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (response.ok) {
        setUnlocked(false);
        setViewerOpen(false);
      }
    } catch (err) {
      console.error("Gagal mengunci CV:", err);
    } finally {
      setIsLocking(false);
    }
  }

  const featuresList = language === "id"
    ? ["Pratinjau CV Interaktif", "Unduh format PDF asli", "Data terverifikasi publik"]
    : ["Interaktive PDF-Vorschau", "Original-PDF herunterladen", "Öffentlich verifizierte Daten"];

  return (
    <>
      <div
        className={cn(
          "premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8 select-none transition-all duration-500 border-2",
          unlocked
            ? rememberSession
              ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
              : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
            : "border-line"
        )}
      >
        {isLocking ? (
          /* SECURING SESSION ANIMATED VIEW (UPGRADED) */
          <motion.div 
            key="locking"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-16 gap-6 text-center w-full relative overflow-hidden"
          >
            {/* Background ambient glow orb */}
            <div className="absolute h-32 w-32 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            {/* Central Badge with Dual Spinning Radar Rings */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-rose-500/25"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-rose-500/25"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="absolute -inset-2 rounded-[26px] border-2 border-dashed border-rose-500/40 z-10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
                className="absolute -inset-3.5 rounded-[30px] border-2 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent z-10"
              />
              <motion.div 
                initial={{ rotate: 180, scale: 0.3 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="icon-orbit relative grid h-20 w-20 place-items-center rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-glow shadow-rose-500/10 z-20"
              >
                <motion.span
                  animate={{ scale: [1, 0.9, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <LockKeyhole className="h-9 w-9" />
                </motion.span>
              </motion.div>
            </div>

            {/* Status Text & Dynamic Progress Bar */}
            <div className="space-y-2 max-w-sm w-full z-20 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-rose-500"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>ENKRIPSI SESI AKTIF</span>
              </motion.div>

              <h4 className="font-display text-2xl font-black text-rose-500 tracking-tight">
                {language === "id" ? "Mengamankan Sesi..." : "Sitzung sichern..."}
              </h4>
              <p className="text-xs font-bold text-muted leading-5">
                {language === "id" ? "Memusnahkan token sesi dan mengunci kembali akses server." : "Token wird vernichtet und Zugang wieder gesperrt."}
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full bg-rose-500/15 h-2 rounded-full mt-4 overflow-hidden border border-rose-500/20">
                <motion.div
                  className="bg-rose-500 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        ) : isUnlocking ? (
          /* RESTORING SESSION ANIMATED VIEW (UPGRADED) */
          <motion.div 
            key="unlocking"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-16 gap-6 text-center w-full relative overflow-hidden"
          >
            {/* Background ambient glow orb */}
            <div className="absolute h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Central Badge with Dual Spinning Radar Rings */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-emerald-500/25"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-emerald-500/25"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="absolute -inset-2 rounded-[26px] border-2 border-dashed border-emerald-500/40 z-10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
                className="absolute -inset-3.5 rounded-[30px] border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent z-10"
              />
              <motion.div 
                initial={{ rotate: -180, scale: 0.3 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="icon-orbit relative grid h-20 w-20 place-items-center rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 shadow-glow shadow-emerald-500/10 z-20"
              >
                <motion.span
                  animate={{ scale: [1, 0.9, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ShieldCheck className="h-9 w-9" />
                </motion.span>
              </motion.div>
            </div>

            {/* Status Text & Dynamic Progress Bar */}
            <div className="space-y-2 max-w-sm w-full z-20 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-500"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                <span>MEMULIHKAN OTENTIKASI SERVER</span>
              </motion.div>

              <h4 className="font-display text-2xl font-black text-emerald-500 tracking-tight">
                {language === "id" ? "Memulihkan Sesi Aman..." : "Sitzung wird wiederhergestellt..."}
              </h4>
              <p className="text-xs font-bold text-muted leading-5">
                {language === "id" ? "Akses otomatis dipulihkan karena sesi diingat di browser ini." : "Zugang wird automatisch wiederhergestellt."}
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full bg-emerald-500/15 h-2 rounded-full mt-4 overflow-hidden border border-emerald-500/20">
                <motion.div
                  className="bg-emerald-500 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        ) : checkingAuth ? (
          /* CHECKING AUTH SKELETON (MOBILE OPTIMIZED) */
          <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between animate-pulse">
            <div className="flex gap-3 sm:gap-4 w-full">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl sm:rounded-3xl skeleton-shimmer shrink-0" />
              <div className="w-full space-y-2.5">
                <div className="h-5 sm:h-6 w-36 sm:w-48 rounded skeleton-shimmer" />
                <div className="space-y-1.5">
                  <div className="h-3.5 sm:h-4 w-full rounded skeleton-shimmer" />
                  <div className="h-3.5 sm:h-4 w-3/4 rounded skeleton-shimmer" />
                </div>
              </div>
            </div>
            <div className="h-10 sm:h-12 w-full lg:w-44 rounded-full skeleton-shimmer shrink-0 mt-2 lg:mt-0" />
          </div>
        ) : (
          <>
            {/* Main Content Area (Mobile Responsive Layout) */}
            <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-4">
                <MagneticButton className="shrink-0">
                  <motion.div
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.08, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
                      press: { scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="icon-orbit grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl sm:rounded-3xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                  >
                    <cvAccess.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </motion.div>
                </MagneticButton>
                <div>
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-primary leading-none mb-1">
                    {language === "id" ? "Akses Terproteksi" : "Geschützter Lebenslauf"}
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight">{cvAccess.title}</h3>
                  <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm leading-6 sm:leading-8 text-muted">{cvAccess.description}</p>
                </div>
              </div>

              {!unlocked ? (
                /* ACCESS CV LOCKED BUTTON */
                <MagneticButton className="w-full lg:w-auto">
                  <motion.button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.02, y: -2 },
                      press: { scale: 0.97 }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    className="button-primary focus-ring w-full lg:w-auto border-0 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <LockKeyhole className="h-4.5 w-4.5" />
                    <span>{language === "id" ? "Buka Akses CV" : "Code Eingeben"}</span>
                  </motion.button>
                </MagneticButton>
              ) : (
                /* ACCESS CV UNLOCKED BUTTONS */
                <div className="flex flex-col gap-2.5 sm:items-end w-full lg:w-auto mt-2 lg:mt-0">
                  <div className="flex flex-col gap-2.5 sm:flex-row w-full lg:w-auto">
                    <MagneticButton className="w-full sm:w-[180px]">
                      <motion.button
                        type="button"
                        onClick={() => setViewerOpen(true)}
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: { scale: 1.02, y: -2 },
                          press: { scale: 0.97 }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        className="button-primary focus-ring w-full border-0 sm:w-[180px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="h-4.5 w-4.5" />
                        <span>{language === "id" ? "Lihat CV" : "Lebenslauf ansehen"}</span>
                      </motion.button>
                    </MagneticButton>
                    <MagneticButton className="w-full sm:w-[180px]">
                      <motion.button
                        type="button"
                        onClick={() => setConfirmLock(true)}
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: {
                            scale: 1.03,
                            y: -2,
                            borderColor: "rgba(239, 68, 68, 0.5)",
                            backgroundColor: "rgba(239, 68, 68, 0.12)"
                          },
                          press: {
                            scale: 0.96,
                            borderColor: "rgb(239, 68, 68)",
                            backgroundColor: "rgba(239, 68, 68, 0.25)"
                          }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-colors duration-300 w-full cursor-pointer select-none sm:w-[180px]"
                      >
                        <LockKeyhole className="h-4 w-4" />
                        <span>{language === "id" ? "Kunci Sesi" : "Sperren"}</span>
                      </motion.button>
                    </MagneticButton>
                  </div>
                  
                  {/* Switch bar for Remember Session on mobile */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-[372px]">
                    <span className="text-[11px] sm:text-xs font-black text-muted leading-tight">
                      {language === "id" ? "Ingat kata sandi & sesi akses di browser ini" : "Sitzung & Passwort auf diesem Browser merken"}
                    </span>
                    <div
                      className={cn(
                        "relative inline-flex h-5 w-10 sm:h-6 sm:w-12 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out select-none items-center touch-pan-x shrink-0",
                        rememberSession
                          ? "bg-emerald-500 border-emerald-500 ring-2 ring-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.45)]"
                          : "bg-rose-500 border-rose-500 ring-2 ring-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.45)]"
                      )}
                      onClick={() => {
                        const nextVal = !rememberSession;
                        setRememberSession(nextVal);
                        localStorage.setItem("remember_session_cv", nextVal ? "true" : "false");
                      }}
                      aria-label={rememberSession ? "Ingat sesi aktif" : "Ingat sesi nonaktif"}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ x: rememberSession ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24) : 0 }}
                        animate={{ x: rememberSession ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24) : 0 }}
                        transition={{ type: "spring", stiffness: 600, damping: 32 }}
                        className="pointer-events-auto h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white shadow ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature lists grid */}
            <div className="mt-5 sm:mt-6 grid gap-2.5 sm:grid-cols-3">
              {featuresList.map((item) => (
                <div key={item} className="touch-shimmer flex items-center gap-2.5 sm:gap-3 rounded-2xl sm:rounded-3xl border border-line bg-surface/80 p-3 sm:p-4 text-xs sm:text-sm font-black text-muted">
                  <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary animate-pulse" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Interactive PDF Viewer Modal */}
      <AnimatePresence>
        {viewerOpen ? (
          <motion.div
            className="modal-backdrop fixed inset-0 z-[120] grid place-items-center p-0 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card flex flex-col h-full md:h-[90vh] w-full max-w-5xl rounded-none md:rounded-4xl overflow-hidden shadow-2xl border border-line bg-surface"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-line px-5 py-4 shrink-0 bg-surface/90 backdrop-blur">
                <p className="inline-flex items-center gap-2 text-sm font-black text-muted">
                  <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Curriculum Vitae — Hajaturrachman
                </p>
                <div className="flex items-center gap-2">
                  <MagneticButton>
                    <motion.button
                      type="button"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      onClick={downloadCv}
                      className="button-primary py-2 px-4 text-xs h-9 border-0"
                    >
                      <Download className="h-4 w-4" />
                      {language === "id" ? "Unduh PDF" : "PDF Herunterladen"}
                    </motion.button>
                  </MagneticButton>
                  <MagneticButton>
                    <motion.button
                      type="button"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      onClick={() => setViewerOpen(false)}
                      className="rounded-full border border-rose-500 bg-rose-500 text-white md:bg-rose-500/10 md:text-rose-500 md:hover:bg-rose-600 md:hover:text-white px-3.5 h-9 text-xs font-black transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none border-0"
                    >
                      <X className="h-4 w-4" />
                      {language === "id" ? "Tutup" : "Schließen"}
                    </motion.button>
                  </MagneticButton>
                </div>
              </div>

              {/* PDF Embed Area */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
                <iframe
                  src="/api/cv/view#toolbar=0"
                  title="PDF Viewer"
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <PasswordModal
        open={modalOpen}
        title={language === "id" ? "Akses Curriculum Vitae" : "Lebenslauf-Zugriff"}
        description={language === "id" ? "Masukkan kata sandi untuk membuka dokumen CV." : "Geben Sie das Passwort ein, um den Lebenslauf freizuschalten."}
        type="cv"
        successTitle={language === "id" ? "Akses Dibuka" : "Zugriff freigeschaltet"}
        successMessage={language === "id" ? "Dokumen CV siap dibaca." : "Der Lebenslauf ist nun freigeschaltet."}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setUnlocked(true);
          setModalOpen(false);
          setViewerOpen(true); // Open the modal automatically on success!
        }}
      />

      <ConfirmModal
        open={confirmLock}
        title={language === "id" ? "Kunci kembali CV?" : "Lebenslauf sperren?"}
        description={language === "id" ? "Akses dokumen akan ditutup dan memerlukan kata sandi untuk dibuka kembali." : "Der Zugriff wird gesperrt und erfordert das Passwort zum erneuten Öffnen."}
        confirmLabel={language === "id" ? "Ya, Kunci" : "Ja, Sperren"}
        cancelLabel={language === "id" ? "Batal" : "Abbrechen"}
        onCancel={() => setConfirmLock(false)}
        onConfirm={handleLockConfirm}
      />
    </>
  );
}
