"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, LockKeyhole, ShieldCheck, Sparkles, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PasswordModal } from "@/components/modals/PasswordModal";
import { useSiteData, useLanguageSelector } from "@/data/site";
import { useLanguage } from "@/components/providers/LanguageContext";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";

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

  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [adminTransition, setAdminTransition] = useState<{ active: boolean; isEnabling: boolean } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("hajat_toggles_state");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.cv !== undefined && !parsed.cv) {
            setIsAdminOverride(true);
            setUnlocked(true);
          }
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  useEffect(() => {
    async function checkAuth(isInitial = false) {
      try {
        const response = await fetch("/api/auth/status", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data.overrides?.cv) {
            // Admin Override Active: Instant transition, no restore session animation!
            setIsAdminOverride(true);
            setUnlocked(true);
            setCheckingAuth(false);
          } else if (data.cvUnlocked) {
            setIsAdminOverride(false);
            const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_cv") === "true";
            if (!remember) {
              if (isInitial) {
                setIsLocking(true);
                setCheckingAuth(false);
                try {
                  await fetch("/api/auth/lock", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "cv" })
                  });
                } catch (e) {
                  console.error(e);
                }
                await new Promise((resolve) => setTimeout(resolve, 1800));
                setUnlocked(false);
                setIsLocking(false);
              } else {
                setUnlocked(false);
                setCheckingAuth(false);
              }
            } else {
              if (isInitial) {
                setIsUnlocking(true);
                setCheckingAuth(false);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setUnlocked(true);
                setIsUnlocking(false);
              } else {
                setUnlocked(true);
                setCheckingAuth(false);
              }
            }
          } else {
            setIsAdminOverride(false);
            setUnlocked(false);
            setCheckingAuth(false);
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa status login:", err);
        setCheckingAuth(false);
      }
    }
    checkAuth(true);

    const unsubscribe = subscribeCrossTabSync(async (msg) => {
      if (msg.event === "TOGGLE_CHANGED") {
        const feat = msg.data?.feature || msg.payload?.feature;
        if (feat === "cv") {
          const isEnabling = msg.data?.protected !== undefined ? !!msg.data.protected : !!msg.payload?.protected;
          setAdminTransition({ active: true, isEnabling });
          await new Promise((r) => setTimeout(r, 1200));

          const res = await fetch("/api/auth/status", { cache: "no-store" });
          let hasSession = false;
          let override = false;
          if (res.ok) {
            const data = await res.json();
            override = !!data.overrides?.cv;
            hasSession = !!data.cvUnlocked;
          }

          if (override) {
            setIsAdminOverride(true);
            setUnlocked(true);
          } else if (hasSession) {
            setIsAdminOverride(false);
            setUnlocked(true); // Persist unlocked session!
          } else {
            setIsAdminOverride(false);
            setUnlocked(false);
            setViewerOpen(false);
          }
          setAdminTransition(null);
          checkAuth(false);
        }
      } else if (
        msg.event === "SESSION_REVOKED" ||
        msg.event === "CONFIG_RESTORED" ||
        msg.event === "PUBLIC_SESSION_INVALID"
      ) {
        try {
          const res = await fetch("/api/auth/status", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (!data.cvUnlocked) {
              setUnlocked(false);
              setViewerOpen(false);
            }
          }
        } catch {
          // Handled
        }
      }
    });
    // Add cross-device polling interval (every 4 seconds) to support multi-device real-time sync
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkAuth(false);
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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
            ? isAdminOverride
              ? "border-blue-500/60 dark:border-blue-500/45 shadow-[0_0_55px_-5px_rgba(59,130,246,0.25)] bg-gradient-to-br from-blue-500/[0.05] via-surface to-blue-500/[0.015] dark:from-blue-500/[0.06] dark:via-slate-950"
              : rememberSession
                ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
                : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
            : "border-line"
        )}
      >
        {adminTransition?.active ? (
          /* ADMIN OVERRIDE TRANSITION ANIMATED OVERLAY */
          <motion.div
            key="admin-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[220px] py-8 px-6 flex flex-col items-center justify-center text-center gap-3.5 w-full"
          >
            <div className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl border shadow-glow",
              adminTransition.isEnabling
                ? "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-rose-500/20"
                : "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-blue-500/20"
            )}>
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <div className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 border",
                adminTransition.isEnabling
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                <span>PENEGASAN ADMINISTRATOR</span>
              </div>
              <h4 className={cn(
                "font-display text-sm sm:text-base font-black",
                adminTransition.isEnabling ? "text-rose-500" : "text-blue-500"
              )}>
                {adminTransition.isEnabling
                  ? "Proteksi Dipulihkan oleh Administrator..."
                  : "Akses Ditingkatkan oleh Administrator..."}
              </h4>
            </div>

            <div className={cn(
              "w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border",
              adminTransition.isEnabling ? "bg-rose-500/15 border-rose-500/20" : "bg-blue-500/15 border-blue-500/20"
            )}>
              <motion.div
                className={cn("h-full rounded-full", adminTransition.isEnabling ? "bg-rose-500" : "bg-blue-500")}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : isLocking ? (
          /* SECURING SESSION ANIMATED VIEW (ADMIN STYLE OVERLAY) */
          <motion.div
            key="locking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[220px] py-8 px-6 flex flex-col items-center justify-center text-center gap-3.5 w-full"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <span>ENKRIPSI SESI</span>
              </div>
              <h4 className="font-display text-sm sm:text-base font-black text-rose-500">
                {language === "id" ? "Mengamankan Sesi..." : "Sitzung sichern..."}
              </h4>
            </div>

            <div className="w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border bg-rose-500/15 border-rose-500/20">
              <motion.div
                className="bg-rose-500 h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : isUnlocking ? (
          /* RESTORING SESSION ANIMATED VIEW (ADMIN STYLE OVERLAY) */
          <motion.div
            key="unlocking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[220px] py-8 px-6 flex flex-col items-center justify-center text-center gap-3.5 w-full"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-glow shadow-emerald-500/20">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span>OTENTIKASI</span>
              </div>
              <h4 className="font-display text-sm sm:text-base font-black text-emerald-500">
                {language === "id" ? "Memulihkan Sesi Aman..." : "Sitzung wird wiederhergestellt..."}
              </h4>
            </div>

            <div className="w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border bg-emerald-500/15 border-emerald-500/20">
              <motion.div
                className="bg-emerald-500 h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
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
            <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-4">
                <motion.div
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.06, rotate: 6, boxShadow: "0 0 18px rgb(var(--color-primary) / 0.35)" },
                    press: { scale: 0.94, rotate: 3, boxShadow: "0 0 12px rgb(var(--color-primary) / 0.5)" }
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                >
                  <cvAccess.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] leading-none ${
                      isAdminOverride ? "text-blue-500" : "text-primary"
                    }`}>
                      {isAdminOverride
                        ? (language === "id" ? "Akses Terbuka (Administrator)" : "Offener Zugang (Administrator)")
                        : (language === "id" ? "Akses Terproteksi" : "Geschützter Lebenslauf")}
                    </p>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight">{cvAccess.title}</h3>
                  <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm leading-6 sm:leading-8 text-muted">{cvAccess.description}</p>
                </div>
              </div>

              {!unlocked ? (
                /* ACCESS CV LOCKED BUTTON */
                <MagneticButton className="w-full sm:w-auto">
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
                    className="button-primary focus-ring w-full sm:w-auto border-0 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <LockKeyhole className="h-4 w-4 shrink-0" />
                    <span>{language === "id" ? "Buka Akses CV" : "Code Eingeben"}</span>
                  </motion.button>
                </MagneticButton>
              ) : (
                /* ACCESS CV UNLOCKED BUTTONS */
                <div className="flex flex-col gap-2.5 sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-col gap-2.5 sm:flex-row w-full sm:w-auto">
                    <MagneticButton className={isAdminOverride ? "w-full sm:w-[220px]" : "w-full sm:w-[180px]"}>
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
                        className={`focus-ring w-full border-0 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer ${
                          isAdminOverride
                            ? "bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-md shadow-blue-600/20 sm:w-[220px]"
                            : "button-primary sm:w-[180px]"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>{language === "id" ? "Lihat CV" : "Lebenslauf ansehen"}</span>
                      </motion.button>
                    </MagneticButton>

                    {!isAdminOverride ? (
                      <MagneticButton className="w-full sm:w-[180px]">
                        <motion.button
                          type="button"
                          onClick={() => setConfirmLock(true)}
                          whileHover="hover"
                          whileTap="press"
                          variants={{
                            hover: { scale: 1.03, y: -2 },
                            press: { scale: 0.95 }
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 12 }}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 active:bg-rose-700 shadow-sm hover:shadow-md hover:shadow-rose-600/20 px-5 py-3 text-xs sm:text-sm font-black transition-all duration-300 w-full cursor-pointer select-none sm:w-[180px]"
                        >
                          <LockKeyhole className="h-4 w-4 shrink-0" />
                          <span>{language === "id" ? "Kunci Sesi" : "Sperren"}</span>
                        </motion.button>
                      </MagneticButton>
                    ) : null}
                  </div>
                  
                  {/* Switch bar for Remember Session (Hidden during Admin Override) */}
                  {!isAdminOverride ? (
                    <div className="flex items-center justify-between gap-2.5 w-full sm:w-[370px]">
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
                  ) : null}
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
