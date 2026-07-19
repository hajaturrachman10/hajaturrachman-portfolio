"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LockKeyhole,
  ShieldCheck,
  Home,
  UsersRound,
  HeartHandshake,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { ImageWithShimmer } from "@/components/ImageWithShimmer";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/MagneticButton";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PasswordModal } from "@/components/PasswordModal";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

const sectionIcons: Record<string, any> = {
  family: Home,
  sahabat: UsersRound,
  "close-friends": HeartHandshake,
  relationship: Heart,
};

function MemoryCarousel({ title, memories }: { title: string; memories: { src: string; caption: string }[] }) {
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth * 0.85 : -el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-3xl border border-line bg-surface/40 p-3.5 sm:p-5 mb-6 sm:mb-8"
    >
      <div className="mb-3.5 sm:mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-2.5 w-2.5 rounded-full bg-primary shrink-0"
          />
          <h4 className="font-display text-base sm:text-lg font-black tracking-tight truncate">
            {language === "id" ? "Galeri Kenangan" : "Erinnerungs-Galerie"} {title}
          </h4>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <MagneticButton>
            <motion.button
              type="button"
              onClick={() => scroll("left")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="focus-ring grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-primary/60 hover:text-text cursor-pointer"
              aria-label={language === "id" ? "Geser kiri" : "Nach links"}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </MagneticButton>
          <MagneticButton>
            <motion.button
              type="button"
              onClick={() => scroll("right")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="focus-ring grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-primary/60 hover:text-text cursor-pointer"
              aria-label={language === "id" ? "Geser kanan" : "Nach rechts"}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </MagneticButton>
        </div>
      </div>
      <div ref={ref} className="scroll-snap-x flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
        {memories.map((m, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="scroll-snap-item relative aspect-[16/10] min-w-[85%] sm:min-w-[46%] lg:min-w-[32%] overflow-hidden rounded-2xl border border-line bg-surface shadow-soft group cursor-pointer"
          >
            <ImageWithShimmer
              src={m.src}
              alt={m.caption}
              fill
              sizes="(max-width: 768px) 85vw, 32vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3.5 sm:p-4 pt-10 sm:pt-12 transition-all duration-300 group-hover:pt-14">
              <p className="text-xs sm:text-sm font-bold text-white leading-5 sm:leading-6">
                {m.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function VaultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl sm:rounded-3xl skeleton-shimmer shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-5 sm:h-6 w-36 sm:w-48 rounded skeleton-shimmer" />
          <div className="h-3.5 sm:h-4 w-3/4 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="h-[180px] sm:h-[220px] w-full rounded-2xl sm:rounded-3xl skeleton-shimmer" />
      <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="overflow-hidden rounded-3xl sm:rounded-4xl border border-line bg-surface/50 p-4 sm:p-5 space-y-3.5">
            <div className="aspect-[4/3] w-full rounded-xl sm:rounded-2xl skeleton-shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-1/2 rounded skeleton-shimmer" />
              <div className="h-3 w-1/3 rounded skeleton-shimmer" />
              <div className="h-8 sm:h-10 w-full rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrivateVaultSection() {
  const { privateVault } = useSiteData();
  const { language } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [vaultData, setVaultData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("family");
  const [isLocking, setIsLocking] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRememberSession(localStorage.getItem("remember_session_private-vault") === "true");
    }
  }, []);

  async function fetchVaultData() {
    setLoadingData(true);
    try {
      const response = await fetch("/api/vault/data");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVaultData(result.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data vault:", err);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/status");
        if (response.ok) {
          const data = await response.json();
          if (data.vaultUnlocked) {
            const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_private-vault") === "true";
            if (!remember) {
              setIsLocking(true);
              setCheckingAuth(false);
              try {
                await fetch("/api/auth/lock", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "private-vault" }),
                });
              } catch (e) {
                console.error(e);
              }
              await new Promise((resolve) => setTimeout(resolve, 1800));
              setUnlocked(false);
              setIsLocking(false);
            } else {
              setIsUnlocking(true);
              setCheckingAuth(false);
              await fetchVaultData();
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
        console.error("Gagal memvalidasi status login:", err);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "private-vault" }),
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (response.ok) {
        setUnlocked(false);
        setVaultData(null);
      }
    } catch (err) {
      console.error("Gagal mengunci vault:", err);
    } finally {
      setIsLocking(false);
    }
  }

  const active = vaultData?.sections?.find((section: any) => section.id === activeSection);

  return (
    <>
      <Reveal id="private" className="container-page section-space pt-0 overflow-hidden">
        <SectionHeader
          eyebrow={language === "id" ? "Ruang Personal" : "Persönlicher Bereich"}
          title={language === "id" ? "Ruang cerita untuk keluarga, sahabat, dan orang terdekat." : "Geschützter Bereich für Familie, Freunde und Angehörige."}
          description={language === "id"
            ? "Bagian ini dilindungi secara aman di server. Di sini tersimpan kenangan foto dan cerita untuk keluarga, sahabat, teman dekat, dan pacar."
            : "Dieser Bereich ist auf dem Server sicher verschlüsselt. Hier werden Fotos und Erinnerungen für Familie, Freunde und Angehörige aufbewahrt."}
        />

        <AnimatePresence mode="wait">
          {isLocking ? (
            /* SECURING SESSION ANIMATED VIEW (UPGRADED & MOBILE-OPTIMIZED) */
            <motion.div 
              key="locking"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card rounded-3xl sm:rounded-4xl p-5 sm:p-10 flex flex-col items-center justify-center py-12 sm:py-16 gap-5 sm:gap-6 text-center border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] via-surface to-surface shadow-[0_0_45px_-10px_rgba(244,63,94,0.18)] w-full relative overflow-hidden"
            >
              <div className="absolute h-36 w-36 sm:h-40 sm:w-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
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
                  className="absolute -inset-1.5 sm:-inset-2 rounded-[22px] sm:rounded-[26px] border-2 border-dashed border-rose-500/40 z-10"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
                  className="absolute -inset-3 sm:-inset-3.5 rounded-[26px] sm:rounded-[30px] border-2 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent z-10"
                />
                <motion.div 
                  initial={{ rotate: 180, scale: 0.3 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="icon-orbit relative grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-glow shadow-rose-500/10 z-20"
                >
                  <motion.span
                    animate={{ scale: [1, 0.9, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <LockKeyhole className="h-7 w-7 sm:h-9 sm:w-9" />
                  </motion.span>
                </motion.div>
              </div>

              <div className="space-y-2 max-w-xs sm:max-w-sm w-full z-20 mt-1 sm:mt-2">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-rose-500"
                >
                  <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                  <span>ENKRIPSI SESI AKTIF</span>
                </motion.div>

                <h4 className="font-display text-xl sm:text-2xl font-black text-rose-500 tracking-tight">
                  {language === "id" ? "Mengamankan Sesi..." : "Sitzung sichern..."}
                </h4>
                <p className="text-xs font-bold text-muted leading-5">
                  {language === "id" ? "Memusnahkan token sesi dan mengunci kembali akses server." : "Token wird vernichtet und Zugang wieder gesperrt."}
                </p>

                <div className="w-full bg-rose-500/15 h-2 rounded-full mt-3.5 sm:mt-4 overflow-hidden border border-rose-500/20">
                  <motion.div
                    className="bg-rose-500 h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.7, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ) : isUnlocking ? (
            /* RESTORING SESSION ANIMATED VIEW (UPGRADED & MOBILE-OPTIMIZED) */
            <motion.div 
              key="unlocking"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card rounded-3xl sm:rounded-4xl p-5 sm:p-10 flex flex-col items-center justify-center py-12 sm:py-16 gap-5 sm:gap-6 text-center border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] via-surface to-surface shadow-[0_0_45px_-10px_rgba(16,185,129,0.18)] w-full relative overflow-hidden"
            >
              <div className="absolute h-36 w-36 sm:h-40 sm:w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
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
                  className="absolute -inset-1.5 sm:-inset-2 rounded-[22px] sm:rounded-[26px] border-2 border-dashed border-emerald-500/40 z-10"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
                  className="absolute -inset-3 sm:-inset-3.5 rounded-[26px] sm:rounded-[30px] border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent z-10"
                />
                <motion.div 
                  initial={{ rotate: -180, scale: 0.3 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="icon-orbit relative grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 shadow-glow shadow-emerald-500/10 z-20"
                >
                  <motion.span
                    animate={{ scale: [1, 0.9, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <ShieldCheck className="h-7 w-7 sm:h-9 sm:w-9" />
                  </motion.span>
                </motion.div>
              </div>

              <div className="space-y-2 max-w-xs sm:max-w-sm w-full z-20 mt-1 sm:mt-2">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500"
                >
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-emerald-400" />
                  <span>MEMULIHKAN OTENTIKASI SERVER</span>
                </motion.div>

                <h4 className="font-display text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">
                  {language === "id" ? "Memulihkan Sesi Aman..." : "Sitzung wird wiederhergestellt..."}
                </h4>
                <p className="text-xs font-bold text-muted leading-5">
                  {language === "id" ? "Akses otomatis dipulihkan karena sesi diingat di browser ini." : "Zugang wird automatisch wiederhergestellt."}
                </p>

                <div className="w-full bg-emerald-500/15 h-2 rounded-full mt-3.5 sm:mt-4 overflow-hidden border border-emerald-500/20">
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
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8"
            >
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
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl sm:rounded-4xl border border-line bg-surface/50 p-3.5 sm:p-5 space-y-2.5">
                      <div className="h-5 w-5 rounded skeleton-shimmer" />
                      <div className="h-4 w-24 sm:w-32 rounded skeleton-shimmer" />
                      <div className="h-3 w-5/6 rounded skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !unlocked ? (
            /* LOCKED VAULT CARD VIEW (MOBILE OPTIMIZED) */
            <motion.div
              key="locked-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 sm:p-8 select-none relative"
            >
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <MagneticButton className="w-fit">
                    <motion.div
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: {
                          scale: 1.08,
                          rotate: 6,
                          borderColor: "rgb(var(--color-primary) / 0.56)",
                          boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)"
                        },
                        press: {
                          scale: 0.88,
                          rotate: 6,
                          borderColor: "rgb(var(--color-primary) / 0.72)",
                          boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)"
                        }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl sm:rounded-3xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                    >
                      <LockKeyhole className="h-7 w-7 sm:h-8 sm:w-8" />
                    </motion.div>
                  </MagneticButton>
                  
                  <h3 className="mt-4 sm:mt-6 font-display text-2xl sm:text-3xl font-black">{privateVault.title}</h3>
                  <p className="mt-2.5 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-muted">{privateVault.description}</p>
                  
                  <MagneticButton className="mt-5 sm:mt-7 w-full sm:w-fit">
                    <motion.button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -3 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-primary shimmer-constant focus-ring w-full sm:w-auto border-0 flex items-center justify-center gap-2.5 cursor-pointer select-none py-3"
                    >
                      <motion.span
                        variants={{
                          hover: { scale: 1.25, rotate: -10 },
                          press: { scale: 0.85, rotate: 0 }
                        }}
                        transition={{ type: "spring", stiffness: 450, damping: 10 }}
                        className="inline-flex items-center"
                      >
                        <LockKeyhole className="h-4 w-4 sm:h-5 sm:w-5" />
                      </motion.span>
                      <span className="text-sm font-black">{language === "id" ? "Masukkan Kata Sandi" : "Code Eingeben"}</span>
                    </motion.button>
                  </MagneticButton>
                </div>

                {/* 2x2 Grid on Mobile for Section Cards */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-1">
                  {privateVault.sections.map((section, idx) => {
                    const Icon = sectionIcons[section.id] || sectionIcons.family;
                    return (
                      <motion.article
                        key={section.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        whileHover={{ y: -4, scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-2xl sm:rounded-4xl border border-line bg-surface/80 p-3.5 sm:p-5 cursor-pointer select-none transition-colors hover:border-primary/45 group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 12 }}
                          className="w-fit"
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <h4 className="mt-2.5 sm:mt-4 font-display text-sm sm:text-lg font-black">{section.title}</h4>
                        <p className="mt-1 text-xs font-bold leading-5 text-muted line-clamp-2 sm:line-clamp-none">{section.summary}</p>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 sm:mt-6 flex gap-2.5 sm:gap-3 rounded-2xl sm:rounded-3xl border border-primary/20 bg-primary/5 p-3.5 sm:p-4 text-xs sm:text-sm font-bold leading-5 sm:leading-6 text-muted"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary animate-pulse" />
                <span>
                  {language === "id"
                    ? "Sesi akses dienkripsi dan diverifikasi secara aman oleh server menggunakan kukis HTTP-only."
                    : "Ihre Sitzung wird sicher vom Server verifiziert und als verschlüsseltes Session-Cookie gespeichert."}
                </span>
              </motion.div>
            </motion.div>
          ) : (
            /* UNLOCKED VAULT MAIN VIEW (MOBILE OPTIMIZED) */
            <motion.div
              key="unlocked-card"
              layout
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "premium-card rounded-3xl sm:rounded-4xl p-4 sm:p-8 select-none transition-all duration-500 border-2",
                rememberSession
                  ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
                  : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
              )}
            >
              {/* Header Info & Lock Button Bar (Mobile Balanced) */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <motion.p 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-primary"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                    <span>{language === "id" ? "Terotentikasi Server Aman" : "Vom Server verifiziert"}</span>
                  </motion.p>
                  <h3 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-3xl font-black">
                    {language === "id" ? "Ruang Personal Hajaturrachman" : "Persönlicher Bereich von Hajat"}
                  </h3>
                </div>
                
                <div className="flex flex-col gap-2.5 sm:items-end w-full sm:w-auto">
                  <MagneticButton className="w-full sm:w-[220px]">
                    <motion.button
                      type="button"
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: {
                          scale: 1.03,
                          y: -3,
                          borderColor: "rgba(239, 68, 68, 0.5)",
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          boxShadow: "0 8px 16px rgba(239, 68, 68, 0.15)"
                        },
                        press: {
                          scale: 0.95,
                          y: 1,
                          borderColor: "rgb(239, 68, 68)",
                          backgroundColor: "rgba(239, 68, 68, 0.25)"
                        }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      onClick={() => setConfirmLock(true)}
                      className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-colors duration-300 focus-ring cursor-pointer select-none w-full sm:w-[220px]"
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
                  
                  {/* Remember Session Switch Bar */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-[220px]">
                    <span className="text-[11px] sm:text-xs font-black text-muted leading-tight">
                      {language === "id" ? "Ingat kata sandi & sesi login di browser ini" : "Sitzung & Passwort auf diesem Browser merken"}
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
                        localStorage.setItem("remember_session_private-vault", nextVal ? "true" : "false");
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

              {/* Animated Category Tabs: 2x2 Grid on Mobile, Flex on Desktop */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {privateVault.sections.map((section) => {
                  const Icon = sectionIcons[section.id] || sectionIcons.family;
                  const isCatActive = activeSection === section.id;
                  return (
                    <MagneticButton key={section.id} className="w-full sm:w-auto">
                      <motion.button
                        type="button"
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: { scale: 1.04, y: -2 },
                          press: { scale: 0.96 }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "focus-ring inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black transition cursor-pointer select-none w-full sm:w-auto text-center truncate",
                          isCatActive
                            ? "border-primary bg-primary text-white shadow-glow shadow-primary/25"
                            : "border-line bg-surface/80 text-muted hover:border-primary/60 hover:text-text"
                        )}
                      >
                        <motion.span
                          variants={{
                            hover: { scale: 1.25, rotate: 10 },
                            press: { scale: 0.85, rotate: -5 }
                          }}
                          transition={{ type: "spring", stiffness: 450, damping: 10 }}
                          className="inline-flex items-center shrink-0"
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.span>
                        <span className="truncate">{section.title}</span>
                      </motion.button>
                    </MagneticButton>
                  );
                })}
              </div>

              {/* Active Category Content Section */}
              <AnimatePresence mode="wait">
                {loadingData || !active ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="mt-5 sm:mt-6 rounded-3xl sm:rounded-4xl border border-line bg-surface/80 p-4 sm:p-6"
                  >
                    <VaultSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 20, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.99 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-5 sm:mt-6 rounded-3xl sm:rounded-4xl border border-line bg-surface/80 p-4 sm:p-7"
                  >
                    {/* Active Section Header (Mobile Responsive Layout) */}
                    <div className="flex flex-row items-center gap-3 sm:gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        className="icon-orbit grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl sm:rounded-3xl border border-line bg-primary/10 text-primary"
                      >
                        {(() => {
                          const Icon = sectionIcons[active.id] || sectionIcons.family;
                          return <Icon className="h-5 w-5 sm:h-7 sm:w-7" />;
                        })()}
                      </motion.div>
                      <div>
                        <h4 className="font-display text-xl sm:text-2xl font-black">{active.title}</h4>
                        <p className="mt-0.5 sm:mt-2 text-xs sm:text-base leading-6 sm:leading-8 text-muted">{active.summary}</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      {/* Swipeable Photo Memory Carousel */}
                      {active.memories && active.memories.length > 0 && (
                        <MemoryCarousel title={active.title} memories={active.memories} />
                      )}

                      {/* Staggered Animated People Grid */}
                      <motion.div 
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.09 }
                          }
                        }}
                        className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {active.people.map((person: any) => (
                          <motion.article
                            key={person.name}
                            variants={{
                              hidden: { opacity: 0, y: 25, scale: 0.96 },
                              show: { opacity: 1, y: 0, scale: 1 }
                            }}
                            whileHover={{ y: -6, scale: 1.015 }}
                            transition={{ type: "spring", stiffness: 350, damping: 18 }}
                            className="overflow-hidden rounded-3xl sm:rounded-4xl border border-line bg-surface flex flex-col justify-between group shadow-soft transition-all hover:border-primary/40"
                          >
                            <div>
                              <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
                                <ImageWithShimmer
                                  src={person.image}
                                  alt={person.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                              </div>
                              <div className="p-4 sm:p-6">
                                <p className="font-display text-lg sm:text-xl font-black">{person.name}</p>
                                <p className="mt-1 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-primary">
                                  {person.role}
                                </p>
                                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-bold leading-6 sm:leading-7 text-muted">
                                  {person.story}
                                </p>
                              </div>
                            </div>
                          </motion.article>
                        ))}
                      </motion.div>
                    </div>

                    {/* Animated Story Paragraphs */}
                    <div className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3">
                      {active.content.map((paragraph: string, idx: number) => (
                        <motion.p
                          key={paragraph}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.15 + idx * 0.06 }}
                          className="rounded-2xl sm:rounded-3xl border border-line bg-surface p-3.5 sm:p-4 text-xs sm:text-base font-bold leading-6 sm:leading-8 text-muted"
                        >
                          {paragraph}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>

      {/* Security Modals */}
      <PasswordModal
        open={modalOpen}
        title={language === "id" ? "Buka Ruang Personal" : "Bereich Freischalten"}
        description={language === "id" ? "Masukkan kata sandi untuk membuka cerita personal." : "Geben Sie das Passwort ein, um den persönlichen Bereich freizuschalten."}
        type="private-vault"
        onClose={() => setModalOpen(false)}
        onSuccess={async () => {
          setUnlocked(true);
          setModalOpen(false);
          await fetchVaultData();
        }}
      />

      <ConfirmModal
        open={confirmLock}
        title={language === "id" ? "Kunci kembali ruang personal?" : "Bereich sperren?"}
        description={language === "id" ? "Ruang personal akan tertutup dan memerlukan kata sandi untuk dibuka lagi." : "Der Bereich wird wieder gesperrt und erfordert ein Passwort zum erneuten Öffnen."}
        confirmLabel={language === "id" ? "Ya, kunci" : "Ja, sperren"}
        cancelLabel={language === "id" ? "Batal" : "Abbrechen"}
        onCancel={() => setConfirmLock(false)}
        onConfirm={handleLockConfirm}
      />
    </>
  );
}
