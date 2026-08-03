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
import { ImageWithShimmer } from "@/components/ui/ImageWithShimmer";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { PasswordModal } from "@/components/modals/PasswordModal";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/providers/LanguageContext";
import { cn } from "@/lib/utils";

const sectionIcons: Record<string, any> = {
  family: Home,
  sahabat: UsersRound,
  "close-friends": HeartHandshake,
  relationship: Heart,
};

import { VaultMemoryCarousel } from "./VaultMemoryCarousel";

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

  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [adminTransition, setAdminTransition] = useState<{ active: boolean; isEnabling: boolean } | null>(null);
  const isAdminOverrideRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("hajat_toggles_state");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const toggles = parsed.toggles || parsed;
          const vaultToggle = toggles.vault;
          if (vaultToggle !== undefined) {
            const isVaultProtected = vaultToggle.protected !== undefined ? vaultToggle.protected : vaultToggle;
            if (!isVaultProtected) {
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

          // NOTE: No animation from polling — only from cross-tab sync (BroadcastChannel).
          // Serverless containers return inconsistent states causing false flip-flop animations.
          isAdminOverrideRef.current = !!data.overrides?.vault;
          if (data.overrides?.vault) {
            setIsAdminOverride(true);
            await fetchVaultData();
            setUnlocked(true);
            setCheckingAuth(false);
          } else if (data.vaultUnlocked) {
            setIsAdminOverride(false);
            const remember = typeof window !== "undefined" && localStorage.getItem("remember_session_private-vault") === "true";
            if (!remember) {
              if (isInitial) {
                setIsLocking(true);
                setCheckingAuth(false);
                try {
                  await fetch("/api/auth/lock", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "private-vault" })
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
                await fetchVaultData();
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setUnlocked(true);
                setIsUnlocking(false);
              } else {
                setUnlocked(true);
                setCheckingAuth(false);
                await fetchVaultData();
              }
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
        console.error("Gagal memeriksa status login:", err);
        setCheckingAuth(false);
        setAdminTransition(null);
      }
    }
    checkAuth(true);

    const unsubscribe = subscribeCrossTabSync(async (msg) => {
      if (msg.event === "TOGGLE_CHANGED") {
        const feat = msg.data?.feature || msg.payload?.feature;
        if (feat === "vault") {
          const isEnabling = msg.data?.protected !== undefined ? !!msg.data.protected : !!msg.payload?.protected;
          setAdminTransition({ active: true, isEnabling });
          await new Promise((r) => setTimeout(r, 1200));

          const res = await fetch("/api/auth/status", { cache: "no-store" });
          let hasSession = false;
          let override = false;
          if (res.ok) {
            const data = await res.json();
            override = !!data.overrides?.vault;
            hasSession = !!data.vaultUnlocked;
          }

          if (override) {
            setIsAdminOverride(true);
            await fetchVaultData();
            setUnlocked(true);
          } else if (hasSession) {
            setIsAdminOverride(false);
            await fetchVaultData();
            setUnlocked(true); // Persist unlocked session!
          } else {
            setIsAdminOverride(false);
            setUnlocked(false);
            setVaultData(null);
            setModalOpen(false);
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
            if (!data.vaultUnlocked) {
              setUnlocked(false);
              setModalOpen(false);
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
      <Reveal id="private" className="container-page section-space overflow-hidden">
        <SectionHeader
          eyebrow={language === "id" ? "Ruang Personal" : "Persönlicher Bereich"}
          title={language === "id" ? "Ruang cerita untuk keluarga, sahabat, dan orang terdekat." : "Geschützter Bereich für Familie, Freunde und Angehörige."}
          description={language === "id"
            ? "Bagian ini dilindungi secara aman di server. Di sini tersimpan kenangan foto dan cerita untuk keluarga, sahabat, teman dekat, dan pacar."
            : "Dieser Bereich ist auf dem Server sicher verschlüsselt. Hier werden Fotos und Erinnerungen für Familie, Freunde und Angehörige aufbewahrt."}
        />

        <AnimatePresence mode="wait">
          {adminTransition?.active ? (
            /* ADMIN OVERRIDE TRANSITION ANIMATED OVERLAY */
            <motion.div
              key="admin-transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
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
              className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
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
              className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none"
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
                    <motion.div
                      onClick={() => setModalOpen(true)}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.06, rotate: 6, boxShadow: "0 0 18px rgb(var(--color-primary) / 0.35)" },
                        press: { scale: 0.94, rotate: 3, boxShadow: "0 0 12px rgb(var(--color-primary) / 0.5)" }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                    >
                      <LockKeyhole className="h-7 w-7 sm:h-8 sm:w-8" />
                    </motion.div>
                  
                  <h3 className="mt-4 sm:mt-6 font-display text-2xl sm:text-3xl font-black">{privateVault.title}</h3>
                  <p className="mt-2.5 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-muted">{privateVault.description}</p>
                  
                  <MagneticButton className="mt-5 sm:mt-7 w-full sm:w-fit">
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
                      className="button-primary shimmer-constant focus-ring w-full sm:w-auto border-0 flex items-center justify-center gap-2 cursor-pointer select-none py-3 px-6 text-sm font-black"
                    >
                      <LockKeyhole className="h-4 w-4 shrink-0" />
                      <span>{language === "id" ? "Buka Akses Private Vault" : "Code Eingeben"}</span>
                    </motion.button>
                  </MagneticButton>
                </div>

                {/* 2x2 Grid on Mobile for Section Cards (Static cards without hover animation) */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-1">
                  {privateVault.sections.map((section, idx) => {
                    const Icon = sectionIcons[section.id] || sectionIcons.family;
                    return (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="rounded-2xl sm:rounded-4xl border border-line bg-surface/80 p-3.5 sm:p-5 select-none"
                      >
                        <div className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h4 className="mt-2.5 sm:mt-4 font-display text-sm sm:text-lg font-black">{section.title}</h4>
                        <p className="mt-1 text-xs font-bold leading-5 text-muted line-clamp-2 sm:line-clamp-none">{section.summary}</p>
                      </motion.div>
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
                isAdminOverride
                  ? "border-blue-500/60 dark:border-blue-500/45 shadow-[0_0_55px_-5px_rgba(59,130,246,0.25)] bg-gradient-to-br from-blue-500/[0.05] via-surface to-blue-500/[0.015] dark:from-blue-500/[0.06] dark:via-slate-950"
                  : rememberSession
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] ${
                      isAdminOverride
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                    <span>
                      {isAdminOverride
                        ? (language === "id" ? "Akses Terbuka (Administrator)" : "Offener Zugang (Administrator)")
                        : (language === "id" ? "Terotentikasi Server Aman" : "Vom Server verifiziert")}
                    </span>
                  </motion.p>
                  <h3 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-3xl font-black">
                    {language === "id" ? "Ruang Personal Hajaturrachman" : "Persönlicher Bereich von Hajat"}
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
                ) : null}
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
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
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
                        className="icon-orbit grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
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
                        <VaultMemoryCarousel title={active.title} memories={active.memories} />
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
