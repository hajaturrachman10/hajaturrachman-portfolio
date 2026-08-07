"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LockKeyhole, ShieldCheck, Instagram, MessageCircle, ExternalLink, FileText, Sparkles, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PasswordModal } from "@/components/modals/PasswordModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/providers/LanguageContext";
import { cn } from "@/lib/utils";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";

export function ECLMaterialSection() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRememberSession(localStorage.getItem("remember_session_ecl-material") !== "false");
    }
  }, []);

  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [adminTransition, setAdminTransition] = useState<{ active: boolean; isEnabling: boolean; type: "ecl" | "document" } | null>(null);
  
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  // Refs for stale-closure-safe polling comparisons
  const isAdminOverrideRef = useRef(false);
  const [docToggles, setDocToggles] = useState<{ doc1: boolean; doc2: boolean; doc3: boolean }>({
    doc1: true,
    doc2: true,
    doc3: true
  });
  const docTogglesRef = useRef({ doc1: true, doc2: true, doc3: true });
  // Keep the initialized flag so we never compare on the very first fetch
  const docTogglesInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("hajat_toggles_state");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const toggles = parsed.toggles || parsed;
          if (toggles.ecl_doc1 !== undefined) {
            setDocToggles({
              doc1: Boolean(toggles.ecl_doc1.protected !== undefined ? toggles.ecl_doc1.protected : toggles.ecl_doc1),
              doc2: Boolean(toggles.ecl_doc2.protected !== undefined ? toggles.ecl_doc2.protected : toggles.ecl_doc2),
              doc3: Boolean(toggles.ecl_doc3.protected !== undefined ? toggles.ecl_doc3.protected : toggles.ecl_doc3)
            });
          }
          const eclToggle = toggles.ecl;
          if (eclToggle !== undefined) {
            const isEclProtected = eclToggle.protected !== undefined ? eclToggle.protected : eclToggle;
            if (!isEclProtected) {
              setIsAdminOverride(true);
              setUnlocked(true);
            }
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
          if (data.toggles) {
            syncLocalToggles(data.toggles, data.globalEpoch);
          }

          const nextOverride = !!data.overrides?.ecl;
          const hasOverrideChanged = !isInitial && (isAdminOverrideRef.current !== nextOverride);

          // Detect document toggle changes from polling (cross-device)
          let hasDocChanged = false;
          let changedDocKey: string | null = null;
          if (!isInitial && docTogglesInitialized.current && docTogglesRef.current && data.docToggles) {
            const prev = docTogglesRef.current;
            const next = data.docToggles;
            if (prev.doc1 !== next.doc1) { hasDocChanged = true; changedDocKey = "doc1"; }
            else if (prev.doc2 !== next.doc2) { hasDocChanged = true; changedDocKey = "doc2"; }
            else if (prev.doc3 !== next.doc3) { hasDocChanged = true; changedDocKey = "doc3"; }
          }

          if (data.docToggles) {
            docTogglesRef.current = data.docToggles;
            docTogglesInitialized.current = true;
            setDocToggles(data.docToggles);
          }

          if (hasOverrideChanged) {
            const isEnabling = !nextOverride;
            setAdminTransition({ active: true, isEnabling, type: "ecl" });
            await new Promise((r) => setTimeout(r, 1200));
          } else if (hasDocChanged && unlockedRef.current && changedDocKey && data.docToggles) {
            const isEnabling = Boolean((data.docToggles as any)[changedDocKey]);
            setAdminTransition({ active: true, isEnabling, type: "document" });
            await new Promise((r) => setTimeout(r, 1200));
          }

          isAdminOverrideRef.current = nextOverride;
          if (data.overrides?.ecl) {
            setIsAdminOverride(true);
            setUnlocked(true);
            setCheckingAuth(false);
          } else if (data.eclUnlocked) {
            setIsAdminOverride(false);
            if (isInitial) {
              // On initial load: check if user opted in to remember this session
              const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_ecl-material") !== "false";
              if (!remember) {
                // Not remembered: show locking animation and kick out
                setIsLocking(true);
                setCheckingAuth(false);
                try {
                  await fetch("/api/auth/lock", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "ecl-material" })
                  });
                } catch (e) {
                  console.error(e);
                }
                await new Promise((resolve) => setTimeout(resolve, 1800));
                setUnlocked(false);
                setIsLocking(false);
              } else {
                // Remembered: restore session with unlock animation
                setIsUnlocking(true);
                setCheckingAuth(false);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setUnlocked(true);
                setIsUnlocking(false);
              }
            } else {
              // On subsequent polls: server says session is valid → KEEP unlocked.
              // Never auto-kick during an active session — user needs time to interact.
              // If they navigate away and come back (isInitial=true), THEN check remember.
              setUnlocked(true);
              setCheckingAuth(false);
            }
          } else {
            isAdminOverrideRef.current = false;
            setIsAdminOverride(false);
            setUnlocked(false);
            setCheckingAuth(false);
          }

          setAdminTransition(null);
        }
      } catch (err) {
        console.error("Gagal memeriksa status login ECL:", err);
        setCheckingAuth(false);
        setAdminTransition(null);
      }
    }
    checkAuth(true);

    const unsubscribe = subscribeCrossTabSync(async (msg) => {
      if (msg.event === "TOGGLE_CHANGED") {
        const feat = msg.data?.feature || msg.payload?.feature;
        const togglesMap = msg.data?.togglesMap || msg.payload?.togglesMap;
        if (!togglesMap) return;

        try {
          localStorage.setItem("hajat_toggles_state", JSON.stringify(togglesMap));
          document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(togglesMap))}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // Ignore
        }

        // 1. Handle Document Access toggles
        if (feat === "ecl_doc1" || feat === "ecl_doc2" || feat === "ecl_doc3") {
          setDocToggles({
            doc1: Boolean(togglesMap.ecl_doc1),
            doc2: Boolean(togglesMap.ecl_doc2),
            doc3: Boolean(togglesMap.ecl_doc3)
          });

          // Only trigger document transition overlay if user is already unlocked (inside)
          if (unlockedRef.current) {
            const isEnabling = Boolean(togglesMap[feat]);
            setAdminTransition({ active: true, isEnabling, type: "document" });
            await new Promise((r) => setTimeout(r, 1200));
            setAdminTransition(null);
          }
        }

        // 2. Handle main ECL protection toggle
        if (feat === "ecl") {
          const isEnabling = Boolean(togglesMap.ecl);
          setAdminTransition({ active: true, isEnabling, type: "ecl" });
          await new Promise((r) => setTimeout(r, 1200));

          // Fetch status to resolve exact auth under the transition cover
          const res = await fetch("/api/auth/status", { cache: "no-store" });
          let hasSession = false;
          let override = false;
          if (res.ok) {
            const data = await res.json();
            override = !!data.overrides?.ecl;
            hasSession = !!data.eclUnlocked;
          }

          if (override) {
            setIsAdminOverride(true);
            setUnlocked(true);
          } else if (hasSession) {
            setIsAdminOverride(false);
            setUnlocked(true); // Persist unlocked status!
          } else {
            setIsAdminOverride(false);
            setUnlocked(false);
          }
          setAdminTransition(null);
          checkAuth(false);
        }
      } else if (
        msg.event === "SESSION_REVOKED" ||
        msg.event === "CONFIG_RESTORED" ||
        msg.event === "PUBLIC_SESSION_INVALID"
      ) {
        checkAuth(false);
        setModalOpen(false);
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

  async function handleLockConfirm() {
    setConfirmLock(false);
    setIsLocking(true);
    try {
      const response = await fetch("/api/auth/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "ecl-material" }),
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (response.ok) {
        setUnlocked(false);
      }
    } catch (err) {
      console.error("Gagal mengunci materi ECL:", err);
    } finally {
      setIsLocking(false);
    }
  }

  const isTransitionRed = adminTransition
    ? (adminTransition.type === "document" ? !adminTransition.isEnabling : adminTransition.isEnabling)
    : false;

  return (
    <>
      <Reveal id="ecl-b2" className="container-page section-space overflow-hidden">
        <SectionHeader
          eyebrow={language === "id" ? "Materi Persiapan" : "Vorbereitungsmaterialien"}
          title="ECL Deutsch B2"
          description={language === "id"
            ? "Kumpulan materi belajar, latihan intensif, dan bocoran soal resmi untuk persiapan ujian sertifikasi bahasa Jerman ECL tingkat B2."
            : "Sammlung von Lernmaterialien, intensiven Übungen und offiziellen Vorbereitungsfragen für die ECL Deutsch B2-Zertifizierungsprüfung."}
        />
        {adminTransition?.active ? (
          /* ADMIN OVERRIDE TRANSITION ANIMATED OVERLAY */
          <motion.div
            key="admin-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
          >
            <div className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl border shadow-glow",
              isTransitionRed
                ? "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-rose-500/20"
                : "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-blue-500/20"
            )}>
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <div className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 border",
                isTransitionRed
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                <span>PENEGASAN ADMINISTRATOR</span>
              </div>
              <h4 className={cn(
                "font-display text-sm sm:text-base font-black",
                isTransitionRed ? "text-rose-500" : "text-blue-500"
              )}>
                {adminTransition.type === "document"
                  ? (adminTransition.isEnabling
                      ? "Akses Dokumen Diaktifkan oleh Administrator..."
                      : "Akses Dokumen Dinonaktifkan oleh Administrator...")
                  : (adminTransition.isEnabling
                      ? "Proteksi Dipulihkan oleh Administrator..."
                      : "Akses Ditingkatkan oleh Administrator...")}
              </h4>
            </div>

            <div className={cn(
              "w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border",
              isTransitionRed ? "bg-rose-500/15 border-rose-500/20" : "bg-blue-500/15 border-blue-500/20"
            )}>
              <motion.div
                className={cn("h-full rounded-full", isTransitionRed ? "bg-rose-500" : "bg-blue-500")}
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
            className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
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
            className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
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
          <div className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8 animate-pulse">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl skeleton-shimmer" />
                <div className="mt-4 sm:mt-6 h-7 sm:h-8 w-40 sm:w-48 rounded skeleton-shimmer" />
                <div className="mt-3 sm:mt-4 space-y-2">
                  <div className="h-3.5 sm:h-4 w-full rounded skeleton-shimmer" />
                  <div className="h-3.5 sm:h-4 w-5/6 rounded skeleton-shimmer" />
                </div>
                <div className="mt-5 sm:mt-6 h-10 sm:h-11 w-36 sm:w-44 rounded-full skeleton-shimmer" />
              </div>
              <div className="rounded-2xl sm:rounded-4xl border border-line bg-surface/80 p-4 sm:p-6 flex flex-col gap-4">
                <div className="h-5 sm:h-6 w-36 sm:w-48 rounded skeleton-shimmer" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded skeleton-shimmer" />
                  <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
                </div>
                <div className="space-y-3 mt-2">
                  <div className="h-11 w-full rounded-xl sm:rounded-2xl skeleton-shimmer" />
                  <div className="h-11 w-full rounded-xl sm:rounded-2xl skeleton-shimmer" />
                </div>
              </div>
            </div>
          </div>
        ) : !unlocked ? (
          /* LOCKED MATERIALS VIEW (MOBILE OPTIMIZED) */
          <div className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8 select-none">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
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
                  <LockKeyhole className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.div>
                <h3 className="mt-4 sm:mt-6 font-display text-2xl sm:text-3xl font-black">
                  {language === "id" ? "Materi Terkunci" : "Inhalte gesperrt"}
                </h3>
                <p className="mt-2.5 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-muted">
                  {language === "id"
                    ? "Bagian ini berisi dokumen penting persiapan ujian ECL B2. Untuk membuka akses, silakan masukkan kata sandi."
                    : "Dieser Bereich enthält wichtige Unterlagen zur Vorbereitung auf die ECL B2-Prüfung. Um fortzufahren, geben Sie bitte das Passwort ein."}
                </p>
                <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:flex-row">
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
                      className="button-primary focus-ring w-full sm:w-auto border-0 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LockKeyhole className="h-4 w-4 shrink-0" />
                      <span>{language === "id" ? "Masukkan Kata Sandi" : "Code Eingeben"}</span>
                    </motion.button>
                  </MagneticButton>
                </div>
              </div>
              <div className="rounded-2xl sm:rounded-4xl border border-line bg-surface/80 p-4 sm:p-6 flex flex-col gap-4">
                <h4 className="font-display text-base sm:text-lg font-black flex items-center gap-2 text-primary">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" /> <span>{language === "id" ? "Cara Meminta Kata Sandi" : "Passwort anfordern"}</span>
                </h4>
                <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-muted">
                  {language === "id"
                    ? "Kata sandi gratis dibagikan untuk teman kuliah, rekan belajar, atau pembelajar bahasa Jerman lainnya. Silakan hubungi saya melalui:"
                    : "Das Passwort ist kostenlos für Studienkollegen, Lernpartner oder Deutschlernende. Kontaktieren Sie mich gerne via:"}
                </p>
                <div className="flex flex-col gap-2.5 mt-2">
                  <MagneticButton className="w-full">
                    <motion.a
                      href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                        language === "id"
                          ? "Halo Hajat, perkenalkan saya [Nama Anda]. Bolehkah saya meminta kata sandi untuk mengakses materi latihan ECL Deutsch B2 di portofolio Anda? Terima kasih."
                          : "Hallo Hajat, ich bin [Ihr Name]. Könnte ich bitte das Passwort für die ECL Deutsch B2-Materialien auf Ihrem Portfolio erhalten? Vielen Dank."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-black transition-colors duration-300 cursor-pointer select-none shadow-md shadow-emerald-600/10 border-0 w-full"
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                      <span>{language === "id" ? "Hubungi via WhatsApp" : "Kontakt via WhatsApp"}</span>
                    </motion.a>
                  </MagneticButton>
                  <MagneticButton className="w-full">
                    <motion.a
                      href="https://instagram.com/saya.hajat"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white px-5 py-3 text-xs sm:text-sm font-black transition-colors duration-300 cursor-pointer select-none shadow-md shadow-pink-600/10 border-0 w-full"
                    >
                      <Instagram className="h-4.5 w-4.5" />
                      <span>{language === "id" ? "Hubungi via Instagram DM" : "Kontakt via Instagram DM"}</span>
                    </motion.a>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "premium-card rounded-3xl sm:rounded-4xl p-4 sm:p-8 select-none transition-all duration-500 border-2",
              isAdminOverride
                ? "border-blue-500/60 dark:border-blue-500/45 shadow-[0_0_55px_-5px_rgba(59,130,246,0.25)] bg-gradient-to-br from-blue-500/[0.05] via-surface to-blue-500/[0.015] dark:from-blue-500/[0.06] dark:via-slate-950"
                : rememberSession
                ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
                : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] ${
                  isAdminOverride
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    : "bg-primary/10 text-primary"
                }`}>
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                  <span>
                    {isAdminOverride
                      ? (language === "id" ? "Akses Terbuka (Administrator)" : "Offener Zugang (Administrator)")
                      : "Server-side Authenticated"}
                  </span>
                </p>
                <h3 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-3xl font-black">
                  {language === "id" ? "Bahan Belajar ECL Deutsch B2" : "ECL Deutsch B2 Lernmaterialien"}
                </h3>
              </div>
              
              {!isAdminOverride ? (
                <div className="flex flex-col gap-2.5 sm:items-end w-full sm:w-auto">
                  <MagneticButton className="w-full sm:w-[240px]">
                    <motion.button
                      type="button"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -2 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      onClick={() => setConfirmLock(true)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 active:bg-rose-700 shadow-sm hover:shadow-md hover:shadow-rose-600/20 px-5 py-3 text-xs sm:text-sm font-black transition-all duration-300 focus-ring cursor-pointer select-none w-full sm:w-[240px]"
                    >
                      <LockKeyhole className="h-4 w-4 shrink-0" />
                      <span>{language === "id" ? "Kunci Sesi" : "Sperren"}</span>
                    </motion.button>
                  </MagneticButton>
                  
                  {/* Switch bar for Remember Session (Hidden during Admin Override) */}
                  <div className="flex items-center justify-between gap-2.5 w-full sm:w-[240px]">
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
                        localStorage.setItem("remember_session_ecl-material", nextVal ? "true" : "false");
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
              ) : null}
            </div>

            <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-2">
              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-line flex flex-col justify-between select-none overflow-hidden"
              >
                <div>
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <FileText className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <h4 className="mt-3.5 sm:mt-4 font-display text-base sm:text-xl font-black leading-snug break-words">
                    {language === "id" ? "Dokumen 1 — Kumpulan Contoh Soal Ujian ECL B2" : "Dokument 1 — ECL B2 Beispielaufgaben Sammlung"}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted break-words">
                    {language === "id"
                      ? "Kumpulan lembar latihan resmi dan contoh soal struktur ujian ECL Deutsch B2 lengkap dengan petunjuk pengerjaan."
                      : "Sammlung offizieller Übungsblätter und Beispielaufgaben der ECL Deutsch B2 Prüfung mit Bearbeitungshinweisen."}
                  </p>
                </div>
                <MagneticButton className="mt-5 sm:mt-6 w-full">
                  <motion.a
                    href={
                      docToggles.doc1
                        ? "https://docs.google.com/document/d/1KHzF7IriKkR2p4oFFRq_XQx3IXHL6k5Dky1wp5c8HOo/edit?usp=sharing"
                        : "/ecl-b2/unavailable?doc=1"
                    }
                    target={docToggles.doc1 ? "_blank" : "_self"}
                    rel={docToggles.doc1 ? "noopener noreferrer" : undefined}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.02, y: -2 },
                      press: { scale: 0.97 }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    className="button-primary focus-ring w-full flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 sm:py-3 border-0"
                  >
                    <span>{language === "id" ? "Buka Dokumen" : "Dokument öffnen"}</span>
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </motion.a>
                </MagneticButton>
              </motion.article>

              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-line flex flex-col justify-between select-none overflow-hidden"
              >
                <div>
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <FileText className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <h4 className="mt-3.5 sm:mt-4 font-display text-base sm:text-xl font-black leading-snug break-words">
                    {language === "id" ? "Dokumen 2 — Bocoran Membaca, Menulis & Mendengar B2" : "Dokument 2 — B2 Lesen, Schreiben & Hören Vorbereitung"}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted break-words">
                    {language === "id"
                      ? "Berisi semua kumpulan bocoran soal asli untuk sub-ujian Membaca, Menulis, dan Mendengar ECL Deutsch B2, serta sebagian bocoran asli tema Bagian 2 dan Bagian 3 Ujian Berbicara ECL Deutsch B2."
                      : "Enthält eine Sammlung originaler Übungsaufgaben für die B2-Prüfungsteile Lesen, Schreiben und Hören sowie geleakte Sprechen-Themen für Teil 2 und 3."}
                  </p>
                </div>
                <MagneticButton className="mt-5 sm:mt-6 w-full">
                  <motion.a
                    href={
                      docToggles.doc2
                        ? "https://docs.google.com/document/d/1h_Io7Tl451P8otFz5q_3nS7xyepxJ3FckjAvvW03U0U/edit?usp=sharing"
                        : "/ecl-b2/unavailable?doc=2"
                    }
                    target={docToggles.doc2 ? "_blank" : "_self"}
                    rel={docToggles.doc2 ? "noopener noreferrer" : undefined}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.02, y: -2 },
                      press: { scale: 0.97 }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    className="button-primary focus-ring w-full flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 sm:py-3 border-0"
                  >
                    <span>{language === "id" ? "Buka Dokumen" : "Dokument öffnen"}</span>
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </motion.a>
                </MagneticButton>
              </motion.article>

              {/* Dokumen 3 — Full Width Memanjang di Bawah Dokumen 1 & 2 */}
              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none md:col-span-2 overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <FileText className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <h4 className="font-display text-base sm:text-xl font-black leading-snug break-words min-w-0">
                    {language === "id" ? "Dokumen 3 — Wahyu Ilahi ECL B2 Agustus 2026" : "Dokument 3 — Wahyu Ilahi ECL B2 August 2026"}
                  </h4>
                </div>
                <MagneticButton className="w-full sm:w-auto shrink-0">
                  <motion.a
                    href={
                      docToggles.doc3
                        ? "https://docs.google.com/document/d/1JxCMWPL2n3fyJSYIZ3KVUFUbBdY8cdBc29Z6kO3YHLo/edit?usp=sharing"
                        : "/ecl-b2/unavailable?doc=3"
                    }
                    target={docToggles.doc3 ? "_blank" : "_self"}
                    rel={docToggles.doc3 ? "noopener noreferrer" : undefined}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.02, y: -2 },
                      press: { scale: 0.97 }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    className="button-primary focus-ring w-full sm:w-auto px-6 flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 sm:py-3 border-0"
                  >
                    <span>{language === "id" ? "Buka Dokumen" : "Dokument öffnen"}</span>
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </motion.a>
                </MagneticButton>
              </motion.article>
            </div>

            <div className="mt-5 sm:mt-6 rounded-2xl sm:rounded-3xl border border-line bg-surface/80 p-4 sm:p-6">
              <h4 className="font-display text-base sm:text-lg font-black flex items-center gap-2 text-primary">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" /> <span>{language === "id" ? "Catatan Penting & Penjelasan Materi" : "Wichtige Hinweise & Lehrmaterial-Haftungsausschluss"}</span>
              </h4>
              <div className="mt-4 flex flex-col gap-4 text-sm font-bold leading-7 text-muted">
                <p>
                  💡 <strong>{language === "id" ? "Ungkapan Semangat:" : "Motivation:"}</strong>{" "}
                  {language === "id"
                    ? "Semua materi yang tersaji di sini hanyalah bahan atau latihan belajar tambahan. Jika Anda ingin benar-benar lulus ujian sertifikasi tingkat B2, belajarlah lebih keras! Konsistensi adalah kunci utama keberhasilan Anda."
                    : "Alle hier präsentierten Materialien dienen als zusätzliches Übungsmaterial. Um die B2-Zertifizierungsprüfung erfolgreich zu bestehen, lernen Sie fleißig! Konsistenz ist der Schlüssel zum Erfolg."}
                </p>
                <hr className="border-line" />
                <p>
                  ✍️ <strong>{language === "id" ? "Jawaban Ujian Menulis & Berbicara:" : "Antworten für Schreiben & Sprechen:"}</strong>{" "}
                  {language === "id"
                    ? "Perlu diingat bahwa semua jawaban Ujian Menulis dan Berbicara di dokumen ini bukanlah jawaban resmi dari pihak ECL, melainkan tulisan buatan Hajat sendiri yang disederhanakan setara versi B1+ agar lebih mudah dipelajari. Sangat disarankan untuk memodifikasi dan mengembangkan sendiri struktur jawabannya agar setara standar B2 untuk mendapatkan nilai maksimal."
                    : "Bitte beachten Sie, dass die Musterantworten für Schreiben und Sprechen in diesem Dokument nicht die offiziellen Antworten von ECL sind. Sie wurden von Hajat auf dem Niveau B1+ verfasst, um das Erlernen zu erleichtern. Es wird dringend empfohlen, die Antworten anzupassen, um dem B2-Standard für die Höchstpunktzahl gerecht zu werden."}
                </p>
                <hr className="border-line" />
                <p>
                  🎧 <strong>{language === "id" ? "Jawaban Ujian Membaca & Mendengar:" : "Antworten für Lesen & Hören:"}</strong>{" "}
                  {language === "id"
                    ? "Jawaban Ujian Membaca dan Mendengar adalah kunci jawaban resmi asli dari ECL. Namun, beberapa jawaban ada yang belum pasti (ditandai dengan tanda kurung). Pada beberapa bagian Ujian Mendengar, ada file audio yang tersedia tetapi soalnya tidak ada, dan sebaliknya ada soal tetapi jawabannya belum lengkap. Secara keseluruhan, sekitar 85% materi di sini sudah lengkap, valid, dan sangat sesuai dengan format ujian asli."
                    : "Die Antworten für Lesen und Hören basieren auf den offiziellen ECL-Lösungsschlüsseln. Einige Antworten sind jedoch vorläufig (in Klammern). Bei einigen Hören-Teilen sind Audiodateien ohne Fragen verfügbar, oder umgekehrt. Insgesamt sind etwa 85% des Materials vollständig, valide und entsprechen dem echten Prüfungsformat."}
                </p>
                <div className="mt-4 pt-4 border-t border-line text-right">
                  <p className="font-display text-base font-black italic text-text">
                    {language === "id" ? "Salam hangat perjuangan," : "Herzliche Grüße und viel Erfolg,"}<br />
                    <span className="gradient-text font-black not-italic text-lg">
                      {language === "id" ? "— Dari Hajat" : "— Von Hajat"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Reveal>

      <PasswordModal
        open={modalOpen}
        title={language === "id" ? "Masukkan Kata Sandi ECL" : "Passwort eingeben"}
        description={language === "id" ? "Silakan masukkan kata sandi untuk membuka berkas materi latihan ECL Deutsch B2." : "Geben Sie bitte das Passwort ein, um die ECL B2-Übungsmaterialien freizuschalten."}
        type="ecl-material"
        successTitle={language === "id" ? "Akses Diberikan" : "Zugriff gewährt"}
        successMessage={language === "id" ? "Kata sandi terverifikasi. Selamat belajar dan semoga sukses ujiannya!" : "Passwort verifiziert. Viel Erfolg beim Lernen und bei der Prüfung!"}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          setUnlocked(true);
        }}
      />

      <ConfirmModal
        open={confirmLock}
        title={language === "id" ? "Kunci Akses Materi?" : "Zugriff sperren?"}
        description={language === "id" ? "Apakah Anda yakin ingin mengunci kembali akses ke berkas materi persiapan ECL B2?" : "Sind Sie sicher, dass Sie den Zugriff auf die ECL B2-Materialien wieder sperren möchten?"}
        confirmLabel={language === "id" ? "Ya, kunci" : "Ja, sperren"}
        cancelLabel={language === "id" ? "Batal" : "Abbrechen"}
        onConfirm={handleLockConfirm}
        onCancel={() => setConfirmLock(false)}
      />
    </>
  );
}

function syncLocalToggles(serverToggles: any, serverEpoch: number) {
  if (typeof window === "undefined" || !serverToggles) return;
  
  const raw = localStorage.getItem("hajat_toggles_state");
  let localData: any = null;
  if (raw) {
    try {
      localData = JSON.parse(raw);
    } catch {
      localData = null;
    }
  }

  if (localData && !localData.toggles) {
    localData = {
      toggles: Object.keys(localData).reduce((acc, key) => {
        acc[key] = { protected: localData[key], updatedAt: 0 };
        return acc;
      }, {} as any),
      globalEpoch: 0
    };
  }

  const merged = {
    toggles: { ...serverToggles },
    globalEpoch: Math.max(serverEpoch || 0, localData?.globalEpoch || 0)
  };

  if (localData?.toggles) {
    Object.keys(localData.toggles).forEach((key) => {
      const serverVal = serverToggles[key];
      const localVal = localData.toggles[key];
      if (serverVal && localVal) {
        const serverTime = Number(serverVal.updatedAt) || 0;
        const localTime = Number(localVal.updatedAt) || 0;
        
        if (localTime > serverTime) {
          merged.toggles[key] = {
            protected: localVal.protected,
            updatedAt: localTime
          };
        }
      }
    });
  }

  localStorage.setItem("hajat_toggles_state", JSON.stringify(merged));
  document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=31536000; SameSite=Lax`;
}
