"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, LayoutDashboard, ToggleLeft, Shield, BarChart3, Settings, Activity, ListFilter, History, AlertTriangle, Sparkles, RefreshCw, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AdminOverviewTab } from "./tabs/AdminOverviewTab";
import { AdminFeaturesTab } from "./tabs/AdminFeaturesTab";
import { AdminSecurityTab } from "./tabs/AdminSecurityTab";
import { AdminStatisticsTab } from "./tabs/AdminStatisticsTab";
import { AdminMessagesTab } from "./tabs/AdminMessagesTab";
import { AdminSettingsTab } from "./tabs/AdminSettingsTab";
import { AdminHealthTab } from "./tabs/AdminHealthTab";
import { AdminAuditTab } from "./tabs/AdminAuditTab";
import { AdminConfigHistoryTab } from "./tabs/AdminConfigHistoryTab";
import { AdminStats, FeatureType, FeatureToggleState } from "@/services/admin/adminTypes";
import { SystemHealthReport } from "@/services/admin/adminHealthService";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { useLanguage } from "@/components/providers/LanguageContext";

type AdminTabKey = "overview" | "security" | "messages" | "settings";

type AdminDashboardViewProps = {
  adminUsername: string;
  onLogout: () => void;
};

export function AdminDashboardView({ adminUsername, onLogout }: AdminDashboardViewProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTabKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_tab");
      if (saved === "overview" || saved === "security" || saved === "messages" || saved === "settings") {
        return saved;
      }
      // Migration mapping for legacy tab keys
      if (saved === "features") return "security";
      if (saved === "statistics" || saved === "health") return "overview";
      if (saved === "history" || saved === "audit") return "settings";
    }
    return "overview";
  });

  const handleTabChange = (tab: AdminTabKey) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_active_tab", tab);
    }
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [toggles, setToggles] = useState<Record<FeatureType, FeatureToggleState> | null>(null);
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isSecuringSession, setIsSecuringSession] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Dynamic Browser Tab Title updating based on active admin tab & language
  useEffect(() => {
    if (typeof document === "undefined") return;

    const tabTitlesID: Record<AdminTabKey, string> = {
      overview: "Ikhtisar & Performa Admin",
      security: "Proteksi & Keamanan Sesi",
      messages: "Kotak Masuk Pesan Publik",
      settings: "Pengaturan Sistem & Log"
    };

    const tabTitlesDE: Record<AdminTabKey, string> = {
      overview: "Übersicht & Statistik",
      security: "Schutz & Sicherheit",
      messages: "Nachrichten Posteingang",
      settings: "Einstellungen & Logs"
    };

    const currentTabTitle = language === "de" ? tabTitlesDE[activeTab] : tabTitlesID[activeTab];
    const prefix = language === "de" ? "Admin-Kontrollzentrum" : "Pusat Kendali Admin";

    document.title = `${currentTabTitle} — ${prefix} | Hajaturrachman`;
  }, [activeTab, language]);

  // Initialize rememberSession default TRUE if not stored yet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("remember_session_admin");
      if (stored === null) {
        localStorage.setItem("remember_session_admin", "true");
        setRememberSession(true);
      } else {
        setRememberSession(stored === "true");
      }
    }
  }, []);

  useEffect(() => {
    if (!confirmLogout) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [confirmLogout]);


  const fetchDashboardData = useCallback(async () => {
    try {
      const [featuresRes, statsRes, healthRes] = await Promise.all([
        fetch("/api/admin/features"),
        fetch("/api/admin/statistics"),
        fetch("/api/admin/health")
      ]);

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        if (data.success) setToggles(data.toggles);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) setStats(data.stats);
      }
      if (healthRes.ok) {
        const data = await healthRes.json();
        if (data.success) setHealth(data.health);
      }
    } catch {
      // Data fetch error handled
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // 1. Periodic Real-Time Heartbeat Sync every 4 seconds (runs ONLY when tab is visible to save Vercel serverless quota)
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDashboardData();
      }
    }, 4000);

    // 2. Real-time Event Listeners (Tab Focus, Storage, Contact Submissions)
    const handleFocusOrStorage = () => {
      fetchDashboardData();
    };

    window.addEventListener("visibilitychange", handleFocusOrStorage);
    window.addEventListener("storage", handleFocusOrStorage);
    window.addEventListener("contact_message_submitted", handleFocusOrStorage);

    // 3. Subscribe to Cross-Tab Broadcast Channel Sync
    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (msg.event === "ADMIN_LOGOUT" || msg.event === "ADMIN_SESSION_EXPIRED") {
        onLogout();
      } else if (
        msg.event === "TOGGLE_CHANGED" ||
        msg.event === "CONFIG_RESTORED" ||
        msg.event === "CONFIG_UPDATED" ||
        msg.event === "STRATEGY_UPDATED" ||
        msg.event === "LOCKOUT_RESET"
      ) {
        fetchDashboardData();
      }
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleFocusOrStorage);
      window.removeEventListener("storage", handleFocusOrStorage);
      window.removeEventListener("contact_message_submitted", handleFocusOrStorage);
      unsubscribe();
    };
  }, [fetchDashboardData, onLogout]);

  // Consolidated 4 Primary Tabs
  const navTabs: Array<{ key: AdminTabKey; label: { id: string; de: string }; icon: typeof LayoutDashboard }> = [
    { key: "overview", label: { id: "Ikhtisar & Analisis", de: "Übersicht & Statistik" }, icon: LayoutDashboard },
    { key: "security", label: { id: "Proteksi & Keamanan", de: "Schutz & Sicherheit" }, icon: Shield },
    { key: "messages", label: { id: "Kotak Masuk", de: "Nachrichten" }, icon: Mail },
    { key: "settings", label: { id: "Pengaturan & Log", de: "Einstellungen & Logs" }, icon: Settings }
  ];

  if (isSecuringSession) {
    return (
      <div className="container-page pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none shadow-card"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
              className="inline-flex shrink-0"
            >
              <Loader2 className="h-6 w-6" />
            </motion.div>
          </div>

          <div>
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span>PENUTUPAN SESI ADMIN</span>
            </div>
            <h4 className="font-display text-sm sm:text-base font-black text-rose-500">
              Mengakhiri Sesi & Menghapus Token...
            </h4>
          </div>

          <div className="w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border bg-rose-500/15 border-rose-500/20">
            <motion.div
              className="bg-rose-500 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-page pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-2rem)] flex flex-col gap-5 sm:gap-6 overflow-hidden">
      {/* Admin Top Header */}
      <header className={cn(
        "premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-card transition-all duration-500",
        rememberSession
          ? "border-emerald-500/60 dark:border-emerald-500/45 shadow-[0_0_55px_-5px_rgba(16,185,129,0.25)] bg-gradient-to-br from-emerald-500/[0.05] via-surface to-emerald-500/[0.015] dark:from-emerald-500/[0.06] dark:via-slate-950"
          : "border-rose-500/60 dark:border-rose-500/45 shadow-[0_0_55px_-5px_rgba(244,63,94,0.25)] bg-gradient-to-br from-rose-500/[0.05] via-surface to-rose-500/[0.015] dark:from-rose-500/[0.06] dark:via-slate-950"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="font-display text-lg sm:text-xl font-black text-primary truncate flex items-center gap-2">
                <span>{language === "de" ? "Admin-Kontrollzentrum" : "Pusat Kendali Admin"}</span>
                <span className="text-xs sm:text-sm font-bold text-muted/70 font-mono">v2.5.0</span>

              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-muted mt-0.5 truncate">
              {language === "de" ? "Angemeldet als" : "Masuk sebagai"} <span className="text-primary">{adminUsername}</span>
            </p>
          </div>
        </div>

        {/* Logout Button & Remember Session Switch (1:1 with Kunci Sesi) */}
        <div className="flex flex-col gap-2.5 items-stretch sm:items-end w-full sm:w-auto">
          <MagneticButton className="w-full sm:w-[240px]">
            <motion.button
              type="button"
              whileHover="hover"
              whileTap="press"
              variants={{
                hover: { scale: 1.02, y: -1 },
                press: { scale: 0.96 }
              }}
              transition={{ type: "spring", stiffness: 380, damping: 12 }}
              onClick={() => setConfirmLogout(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 active:bg-rose-700 shadow-sm hover:shadow-md hover:shadow-rose-600/20 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all duration-300 focus-ring cursor-pointer select-none w-full sm:w-[240px]"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{language === "de" ? "Admin Abmelden" : "Keluar Admin"}</span>
            </motion.button>
          </MagneticButton>
          
          {/* Switch bar for Remember Session */}
          <div className="flex items-center justify-between gap-2.5 p-2 sm:p-0 rounded-xl sm:rounded-none bg-surface/50 sm:bg-transparent border sm:border-0 border-line w-full sm:w-[240px]">
            <span className="text-[11px] sm:text-xs font-black text-muted leading-tight">
              Ingat kata sandi & sesi akses di browser ini
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
                localStorage.setItem("remember_session_admin", nextVal ? "true" : "false");
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
      </header>

      {/* Simplified Top Navigation Tabs (4 Clean Tabs) */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-1 select-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`w-full relative px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer select-none transition-all duration-100 ease-out active:scale-[0.985] ${
                isActive
                  ? "bg-primary text-surface border border-primary/50 shadow-xs"
                  : "bg-surface/70 text-muted border border-line hover:text-primary hover:bg-surface hover:border-primary/40"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate min-w-0">{language === "id" ? tab.label.id : tab.label.de}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Content Panel */}
      <main className="w-full p-1 sm:p-1.5 min-h-[450px]">
        <div className="flex flex-col gap-6">
          {/* 1. OVERVIEW & ANALYTICS TAB */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <AdminOverviewTab
                stats={stats}
                toggles={toggles}
                healthStatus={health?.status || "OK"}
              />
              <AdminStatisticsTab stats={stats} onRefresh={fetchDashboardData} />
              <AdminHealthTab health={health} />
            </div>
          )}

          {/* 2. PROTEKSI & KEAMANAN TAB */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-6">
              <AdminFeaturesTab toggles={toggles} onRefresh={fetchDashboardData} />
              <AdminSecurityTab onLogout={() => setConfirmLogout(true)} />
            </div>
          )}

          {/* 3. KOTAK MASUK TAB */}
          {activeTab === "messages" && (
            <div className="flex flex-col gap-6">
              <AdminMessagesTab />
            </div>
          )}

          {/* 4. PENGATURAN & LOG TAB */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6">
              <AdminSettingsTab
                currentUsername={adminUsername}
                onRefresh={fetchDashboardData}
              />
              <AdminConfigHistoryTab />
              <AdminAuditTab />
            </div>
          )}
        </div>
      </main>

      {/* PRIORITAS 9: Logout Confirmation Modal */}
      <AnimatePresence>
        {confirmLogout ? (
          <motion.div
            className="modal-backdrop fixed inset-0 z-[120] grid place-items-center px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={() => setConfirmLogout(false)}
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
              onClick={(e) => e.stopPropagation()}
              className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.06, rotate: 6 }}
                  whileTap={{ scale: 0.94, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 cursor-pointer select-none"
                >
                  <LogOut className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.div>
                <div className="w-full">
                  <h3 className="font-display text-xl sm:text-2xl font-black">Keluar dari Sesi Admin?</h3>
                  <p className="mt-2 text-xs sm:text-sm font-bold leading-6 text-muted">
                    Sesi admin Anda akan diakhiri dan cookie admin_session akan dihapus. Anda perlu memasukkan kredensial admin untuk masuk kembali.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full mt-2">
                  <MagneticButton className="w-full">
                    <motion.button
                      type="button"
                      onClick={async () => {
                        setConfirmLogout(false);
                        setIsSecuringSession(true);
                        localStorage.removeItem("remember_session_admin");
                        await new Promise((resolve) => setTimeout(resolve, 850));
                        onLogout();
                      }}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-primary focus-ring w-full py-3 text-sm font-black flex items-center justify-center gap-2 border-0 select-none cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Ya, Logout Admin</span>
                    </motion.button>
                  </MagneticButton>
                  <MagneticButton className="w-full">
                    <motion.button
                      type="button"
                      onClick={() => setConfirmLogout(false)}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-secondary-negative focus-ring w-full py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span>Batal</span>
                    </motion.button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
