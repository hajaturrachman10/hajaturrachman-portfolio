"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, LayoutDashboard, ToggleLeft, Shield, BarChart3, Settings, Activity, ListFilter, History, AlertTriangle, Sparkles, RefreshCw, ArrowLeft, Mail } from "lucide-react";
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

type AdminTabKey = "overview" | "features" | "security" | "statistics" | "messages" | "settings" | "history" | "health" | "audit";

type AdminDashboardViewProps = {
  adminUsername: string;
  onLogout: () => void;
};

export function AdminDashboardView({ adminUsername, onLogout }: AdminDashboardViewProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTabKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_tab") as AdminTabKey | null;
      if (saved && ["overview", "features", "security", "statistics", "messages", "settings", "history", "health", "audit"].includes(saved)) {
        return saved;
      }
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

  // Securing check on mount if remember_session_admin is false
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("remember_session_admin");
    if (stored === "false") {
      setIsSecuringSession(true);
      const timer = setTimeout(() => {
        onLogout();
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [onLogout]);

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

    // 1. Periodic Real-Time Heartbeat Sync every 4 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
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

  const navTabs: Array<{ key: AdminTabKey; label: { id: string; de: string }; icon: typeof LayoutDashboard }> = [
    { key: "overview", label: { id: "Ikhtisar", de: "Übersicht" }, icon: LayoutDashboard },
    { key: "features", label: { id: "Sakelar Fitur", de: "Funktionen" }, icon: ToggleLeft },
    { key: "security", label: { id: "Keamanan", de: "Sicherheit" }, icon: Shield },
    { key: "statistics", label: { id: "Statistik", de: "Statistiken" }, icon: BarChart3 },
    { key: "messages", label: { id: "Kotak Masuk", de: "Nachrichten" }, icon: Mail },
    { key: "settings", label: { id: "Pengaturan", de: "Einstellungen" }, icon: Settings },
    { key: "history", label: { id: "Riwayat Konfig", de: "Verlauf" }, icon: History },
    { key: "health", label: { id: "Kesehatan", de: "Zustand" }, icon: Activity },
    { key: "audit", label: { id: "Log Audit", de: "Audit-Log" }, icon: ListFilter }
  ];



  if (isSecuringSession) {
    return (
      <div className="container-page pt-28 sm:pt-32 pb-16 min-h-screen grid place-items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center text-center gap-4 max-w-md w-full border border-line bg-surface select-none shadow-2xl"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>

          <div>
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span>ENKRIPSI SESI ADMIN</span>
            </div>
            <h4 className="font-display text-sm sm:text-base font-black text-rose-500">
              Mengamankan Sesi...
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
      </div>
    );
  }

  return (
    <div className="container-page pt-28 sm:pt-32 pb-16 min-h-screen flex flex-col gap-5 sm:gap-6 overflow-hidden">
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
              <h1 className="font-display text-lg sm:text-xl font-black text-primary truncate">Admin Control Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                v2.2 Active
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-muted mt-0.5 truncate">
              Logged in as <span className="text-primary">{adminUsername}</span>
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
              <span>Logout Admin</span>
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

      {/* Top Navigation Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto py-2 px-4 -mx-4 scrollbar-none touch-pan-x">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <MagneticButton key={tab.key} className="shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "bg-primary text-surface shadow-md shadow-primary/20"
                    : "bg-surface/70 text-muted border border-line hover:text-primary hover:bg-surface shadow-xs"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>{language === "id" ? tab.label.id : tab.label.de}</span>
              </button>
            </MagneticButton>
          );
        })}
        {/* Spacer to prevent cut-off at the end of horizontal scroll */}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </nav>

      {/* Tab Content Panel */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <AdminOverviewTab
                stats={stats}
                toggles={toggles}
                healthStatus={health?.status || "OK"}
              />
            )}
            {activeTab === "features" && (
              <AdminFeaturesTab toggles={toggles} onRefresh={fetchDashboardData} />
            )}
            {activeTab === "security" && <AdminSecurityTab onLogout={() => setConfirmLogout(true)} />}
            {activeTab === "statistics" && <AdminStatisticsTab stats={stats} />}
            {activeTab === "messages" && <AdminMessagesTab />}
            {activeTab === "settings" && (
              <AdminSettingsTab
                currentUsername={adminUsername}
                onRefresh={fetchDashboardData}
              />
            )}
            {activeTab === "history" && <AdminConfigHistoryTab />}
            {activeTab === "health" && <AdminHealthTab health={health} />}
            {activeTab === "audit" && <AdminAuditTab />}
          </motion.div>
        </AnimatePresence>
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
                      onClick={() => {
                        setConfirmLogout(false);
                        localStorage.removeItem("remember_session_admin");
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
