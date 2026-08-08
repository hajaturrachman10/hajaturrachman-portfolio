"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw, Lock, AlertCircle, CheckCircle2, Download, ShieldCheck, Clock, Users, Key } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import dynamic from "next/dynamic";

const ConfirmModal = dynamic(
  () => import("@/components/modals/ConfirmModal").then((mod) => mod.ConfirmModal),
  { ssr: false }
);
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";
import { toast } from "@/components/ui/Toast";

type AdminSecurityTabProps = {
  onLogout: () => void;
};

export function AdminSecurityTab({ onLogout }: AdminSecurityTabProps) {
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const notify = (type: "success" | "error", text: string) => {
    toast({ message: text, type: type === "error" ? "error" : "success" });
  };

  // Level 2 Confirm Modal State
  const [modalConfig, setModalConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    icon?: any;
    iconClassName?: string;
    confirmButtonClassName?: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {}
  });

  // Level 3 ReAuth Modal State
  const [reAuthModalConfig, setReAuthModalConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {}
  });

  const fetchSecurityOverview = async () => {
    try {
      const res = await fetch("/api/admin/security");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSecurityData(data.security);
      }
    } catch {
      // Handle error silently
    }
  };

  useEffect(() => {
    fetchSecurityOverview();
  }, []);

  const handleExportConfiguration = async () => {
    try {
      const res = await fetch("/api/admin/configuration/export", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengunduh konfigurasi.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-config-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      notify("success", "File ekspor konfigurasi (.json) berhasil diunduh.");
    } catch {
      notify("error", "Terjadi kesalahan saat mengunduh konfigurasi.");
    }
  };

  const handleResetLockouts = () => {
    setModalConfig({
      open: true,
      title: "Reset Seluruh Pembekuan IP?",
      description: "Aksi ini akan menghapus seluruh catatan pembekuan IP rate-limit pengunjung secara instan.",
      confirmLabel: "Ya, Reset Lockout IP",
      icon: RefreshCw,
      iconClassName: "border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-glow shadow-amber-500/20",
      confirmButtonClassName: "button-primary !bg-none !bg-amber-600 hover:!bg-amber-500 active:!bg-amber-700 !text-white shadow-md shadow-amber-600/20",
      action: async () => {
        setLoading(true);
        setModalConfig((prev) => ({ ...prev, open: false }));
        try {
          const res = await fetch("/api/admin/lockout/reset", { method: "POST" });
          const data = await res.json();
          if (data.success) {
            notify("success", "Seluruh pembekuan IP rate-limit berhasil di-reset.");
            broadcastCrossTabEvent("LOCKOUT_RESET");
            fetchSecurityOverview();
          } else {
            notify("error", data.error || "Gagal mereset lockout.");
          }
        } catch {
          notify("error", "Terjadi kesalahan jaringan.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRevokeSessions = () => {
    setModalConfig({
      open: true,
      title: "Batalkan Seluruh Sesi Publik?",
      description: "Aksi ini akan memperbarui Global Epoch dan membatalkan seluruh cookie sesi pengunjung publik saat ini.",
      confirmLabel: "Ya, Batalkan Sesi Publik",
      icon: ShieldAlert,
      iconClassName: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20",
      confirmButtonClassName: "button-primary !bg-none !bg-rose-600 hover:!bg-rose-500 active:!bg-rose-700 !text-white shadow-md shadow-rose-600/20",
      action: async () => {
        setLoading(true);
        setModalConfig((prev) => ({ ...prev, open: false }));
        try {
          const res = await fetch("/api/admin/session/revoke", { method: "POST" });
          const data = await res.json();
          if (data.success) {
            notify("success", "Seluruh sesi publik pengunjung telah dibatalkan secara global.");
            broadcastCrossTabEvent("SESSION_REVOKED");
            fetchSecurityOverview();
          } else {
            notify("error", data.error || "Gagal membatalkan sesi publik.");
          }
        } catch {
          notify("error", "Terjadi kesalahan jaringan.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Standar Top Header Card (Seragam 1:1) */}
      <div className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-500 cursor-pointer select-none"
          >
            <ShieldCheck className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Keamanan & Integritas Sesi</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Pantau riwayat enkripsi HMAC, reset pembekuan IP, dan kelola sesi pengunjung.
            </p>
          </div>
        </div>

        <MagneticButton className="shrink-0 w-full sm:w-auto relative z-10">
          <motion.button
            type="button"
            onClick={handleExportConfiguration}
            whileHover="hover"
            whileTap="press"
            variants={{
              hover: { scale: 1.02, y: -2 },
              press: { scale: 0.97 }
            }}
            transition={{ type: "spring", stiffness: 380, damping: 12 }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary active:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20 px-4 py-2.5 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none w-full sm:w-auto"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Ekspor Konfigurasi (.json)</span>
          </motion.button>
        </MagneticButton>
      </div>

      {/* Security Overview Dashboard */}
      <div className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-display text-base sm:text-lg font-black text-primary">Ringkasan Keamanan & Aktivitas Admin</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-surface/50 border border-line flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">Last Login IP</span>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-lg font-black text-primary mt-2">
              {securityData?.lastLogin?.ip || "127.0.0.1"}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5">
              {securityData?.lastLogin?.time
                ? new Date(securityData.lastLogin.time).toLocaleString("id-ID")
                : "Aktif"}
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-surface/50 border border-line flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">Failed Logins (Hari ini)</span>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <span className="font-display text-2xl font-black text-rose-500 mt-2">
              {securityData?.loginHistory?.failedCountToday ?? 0}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5">
              Total Failed: {securityData?.loginHistory?.totalFailed ?? 0}
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-surface/50 border border-line flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">Successful Logins</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="font-display text-2xl font-black text-emerald-500 mt-2">
              {securityData?.loginHistory?.successCountToday ?? 1}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5">
              Total Success: {securityData?.loginHistory?.totalSuccess ?? 1}
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-2xl bg-surface/50 border border-line flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">Snapshot Count</span>
              <Key className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="font-display text-2xl font-black text-primary mt-2">
              {securityData?.snapshotCount ?? 0}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5">Historical Versions</span>
          </motion.div>
        </div>
      </div>

      {/* Dangerous Action Safety Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 rounded-3xl border border-line bg-surface flex flex-col justify-between">
          <div>
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-500 cursor-pointer select-none"
            >
              <RefreshCw className="h-6 w-6" />
            </motion.div>
            <div className="flex items-center justify-between mt-4">
              <h3 className="font-display text-lg font-black text-primary">
                Reset Rate Limit
              </h3>
            </div>
            <p className="text-xs font-bold text-muted mt-2 leading-relaxed">
              Bersihkan catatan IP yang dibekukan secara instan.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <MagneticButton className="w-full">
              <motion.button
                type="button"
                disabled={loading}
                onClick={handleResetLockouts}
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.02, y: -2 },
                  press: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 380, damping: 12 }}
                className="button-primary focus-ring w-full py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-0 select-none cursor-pointer disabled:opacity-50 !bg-none !bg-amber-600 hover:!bg-amber-500 active:!bg-amber-700 !text-white shadow-md shadow-amber-600/20"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>Reset Lockout IP</span>
              </motion.button>
            </MagneticButton>
          </div>
        </div>

        <div className="premium-card p-6 rounded-3xl border border-line bg-surface flex flex-col justify-between">
          <div>
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-500 cursor-pointer select-none"
            >
              <ShieldAlert className="h-6 w-6" />
            </motion.div>
            <div className="flex items-center justify-between mt-4">
              <h3 className="font-display text-lg font-black text-primary">
                Batalkan Sesi Publik
              </h3>
            </div>
            <p className="text-xs font-bold text-muted mt-2 leading-relaxed">
              Perbarui Global Epoch untuk membatalkan seluruh cookie sesi pengunjung publik.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <MagneticButton className="w-full">
              <motion.button
                type="button"
                disabled={loading}
                onClick={handleRevokeSessions}
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.02, y: -2 },
                  press: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 380, damping: 12 }}
                className="button-primary focus-ring w-full py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-0 select-none cursor-pointer disabled:opacity-50 !bg-none !bg-rose-600 hover:!bg-rose-500 active:!bg-rose-700 !text-white shadow-md shadow-rose-600/20"
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span>Batalkan Sesi Publik</span>
              </motion.button>
            </MagneticButton>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modalConfig.open}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        icon={modalConfig.icon}
        iconClassName={modalConfig.iconClassName}
        confirmButtonClassName={modalConfig.confirmButtonClassName}
        onConfirm={modalConfig.action}
        onCancel={() => setModalConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
