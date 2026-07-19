"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LockKeyhole, ShieldCheck, Instagram, MessageCircle, ExternalLink, FileText, Sparkles, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { PasswordModal } from "@/components/PasswordModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MagneticButton } from "@/components/MagneticButton";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

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
      setRememberSession(localStorage.getItem("remember_session_ecl-material") === "true");
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/status");
        if (response.ok) {
          const data = await response.json();
          if (data.eclUnlocked) {
            const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_ecl-material") === "true";
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
                  body: JSON.stringify({ type: "ecl-material" }),
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
        console.error("Gagal memeriksa status login ECL:", err);
        setCheckingAuth(false);
      }
    }
    checkAuth();
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

  return (
    <>
      <Reveal id="ecl-b2" className="container-page section-space pt-0">
        <SectionHeader
          eyebrow={language === "id" ? "Materi Persiapan" : "Vorbereitungsmaterialien"}
          title="ECL Deutsch B2"
          description={language === "id"
            ? "Kumpulan materi belajar, latihan intensif, dan bocoran soal resmi untuk persiapan ujian sertifikasi bahasa Jerman ECL tingkat B2."
            : "Sammlung von Lernmaterialien, intensiven Übungen und offiziellen Vorbereitungsfragen für die ECL Deutsch B2-Zertifizierungsprüfung."}
        />
        {isLocking ? (
          /* SECURING SESSION ANIMATED VIEW (UPGRADED) */
          <motion.div 
            key="locking"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card rounded-4xl p-6 sm:p-10 flex flex-col items-center justify-center py-16 gap-6 text-center border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] via-surface to-surface shadow-[0_0_45px_-10px_rgba(244,63,94,0.18)] w-full relative overflow-hidden"
          >
            {/* Background ambient glow orb */}
            <div className="absolute h-40 w-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            {/* Central Badge with Dual Spinning Radar Rings */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-3xl bg-rose-500/25"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                className="absolute inset-0 rounded-3xl bg-rose-500/25"
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
                className="icon-orbit relative grid h-20 w-20 place-items-center rounded-3xl border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-glow shadow-rose-500/10 z-20"
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
            className="premium-card rounded-4xl p-6 sm:p-10 flex flex-col items-center justify-center py-16 gap-6 text-center border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] via-surface to-surface shadow-[0_0_45px_-10px_rgba(16,185,129,0.18)] w-full relative overflow-hidden"
          >
            {/* Background ambient glow orb */}
            <div className="absolute h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Central Badge with Dual Spinning Radar Rings */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-3xl bg-emerald-500/25"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                className="absolute inset-0 rounded-3xl bg-emerald-500/25"
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
                className="icon-orbit relative grid h-20 w-20 place-items-center rounded-3xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 shadow-glow shadow-emerald-500/10 z-20"
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
          <div className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8 animate-pulse">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <MagneticButton className="w-fit">
                  <motion.div
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.08, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
                      press: { scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="icon-orbit grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-2xl sm:rounded-3xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                  >
                    <LockKeyhole className="h-7 w-7 sm:h-8 sm:w-8" />
                  </motion.div>
                </MagneticButton>
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
                      <LockKeyhole className="h-4.5 w-4.5" /> <span>{language === "id" ? "Masukkan Kata Sandi" : "Code Eingeben"}</span>
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
                          ? "Halo Hajat, saya [Nama], boleh saya meminta kata sandi untuk materi ECL Deutsch B2 di portofolio Anda?"
                          : "Hallo Hajat, ich bin [Name]. Könnte ich bitte das Passwort für die ECL Deutsch B2-Materialien auf Ihrem Portfolio erhalten?"
                      )}`}
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
              rememberSession
                ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
                : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-primary">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" /> <span>Server-side Authenticated</span>
                </p>
                <h3 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-3xl font-black">
                  {language === "id" ? "Bahan Belajar ECL Deutsch B2" : "ECL Deutsch B2 Lernmaterialien"}
                </h3>
              </div>
              
              <div className="flex flex-col gap-2.5 sm:items-end w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-[240px]">
                  <motion.button
                    type="button"
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: {
                        scale: 1.03,
                        y: -3,
                        borderColor: "rgba(239, 68, 68, 0.5)",
                        backgroundColor: "rgba(239, 68, 68, 0.12)"
                      },
                      press: {
                        scale: 0.95,
                        borderColor: "rgb(239, 68, 68)",
                        backgroundColor: "rgba(239, 68, 68, 0.25)"
                      }
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 12 }}
                    onClick={() => setConfirmLock(true)}
                    className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-colors duration-300 focus-ring cursor-pointer select-none w-full sm:w-[240px]"
                  >
                    <motion.span
                      variants={{
                        hover: { rotate: 15, scale: 1.2 },
                        press: { rotate: 0, scale: 0.85 }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 10 }}
                      className="inline-flex items-center"
                    >
                      <LockKeyhole className="h-4 w-4" />
                    </motion.span>
                    <span>{language === "id" ? "Kunci Sesi" : "Sitzung sperren"}</span>
                  </motion.button>
                </MagneticButton>
                
                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-[240px]">
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
            </div>

            <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-2">
              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-line flex flex-col justify-between cursor-pointer select-none"
              >
                <div>
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <FileText className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <h4 className="mt-3.5 sm:mt-4 font-display text-lg sm:text-xl font-black">
                    {language === "id" ? "Dokumen 1 — Cerita SUKI & Ujian Berbicara B2" : "Dokument 1 — SUKI-Geschichten & B2-Sprechen"}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted">
                    {language === "id"
                      ? "Berisi cerita singkat SUKI, materi Bagian 1 Ujian Berbicara, Tema Resmi Ujian Berbicara ECL yang diambil langsung dari situs resmi ECL, serta sebagian bocoran asli tema Bagian 2 dan Bagian 3 Ujian Berbicara ECL Deutsch B2."
                      : "Enthält SUKI-Kurzgeschichten, B2-Sprechen Teil 1-Unterlagen, offizielle ECL-Themen direkt von der ECL-Website sowie geleakte Sprechen-Themen für Teil 2 und 3."}
                  </p>
                </div>
                <MagneticButton className="mt-5 sm:mt-6 w-full">
                  <motion.a
                    href="https://docs.google.com/document/d/1KHzF7IriKkR2p4oFFRq_XQx3IXHL6k5Dky1wp5c8HOo/preview"
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
                    <motion.span
                      variants={{
                        hover: { x: 3, y: -3 },
                        press: { x: 1, y: -1 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="inline-flex items-center animate-pulse"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.span>
                  </motion.a>
                </MagneticButton>
              </motion.article>

              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-line flex flex-col justify-between cursor-pointer select-none"
              >
                <div>
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <FileText className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <h4 className="mt-3.5 sm:mt-4 font-display text-lg sm:text-xl font-black">
                    {language === "id" ? "Dokumen 2 — Bocoran Membaca, Menulis & Mendengar B2" : "Dokument 2 — B2 Lesen, Schreiben & Hören Vorbereitung"}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted">
                    {language === "id"
                      ? "Berisi semua kumpulan bocoran soal asli untuk sub-ujian Membaca, Menulis, dan Mendengar ECL Deutsch B2, serta sebagian bocoran asli tema Bagian 2 dan Bagian 3 Ujian Berbicara ECL Deutsch B2."
                      : "Enthält eine Sammlung originaler Übungsaufgaben für die B2-Prüfungsteile Lesen, Schreiben und Hören sowie geleakte Sprechen-Themen für Teil 2 und 3."}
                  </p>
                </div>
                <MagneticButton className="mt-5 sm:mt-6 w-full">
                  <motion.a
                    href="https://docs.google.com/document/d/1h_Io7Tl451P8otFz5q_3nS7xyepxJ3FckjAvvW03U0U/preview"
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
                    <motion.span
                      variants={{
                        hover: { x: 3, y: -3 },
                        press: { x: 1, y: -1 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="inline-flex items-center animate-pulse"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.span>
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
