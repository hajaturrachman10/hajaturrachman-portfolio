"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ToggleLeft, Users, FileText, Lock, BookOpen, Mail, Server } from "lucide-react";
import { AdminStats, FeatureType, FeatureToggleState } from "@/services/admin/adminTypes";

type AdminOverviewTabProps = {
  stats: AdminStats | null;
  toggles: Record<FeatureType, FeatureToggleState> | null;
  healthStatus: string;
};

export function AdminOverviewTab({ stats, toggles, healthStatus }: AdminOverviewTabProps) {
  const protectedCount = toggles
    ? Object.values(toggles).filter((t) => t.protected).length
    : 0;

  const cards = [
    {
      label: "System Status",
      value: healthStatus || "OK",
      icon: Server,
      subtext: "System Operational",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Fitur Terproteksi",
      value: `${protectedCount} / 6`,
      icon: ToggleLeft,
      subtext: "Protection Engine Active",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Total Pengunjung",
      value: stats?.totalVisitors ?? 0,
      icon: Users,
      subtext: "Total Site Visitors",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "CV Unlocks",
      value: stats?.cvUnlocks ?? 0,
      icon: FileText,
      subtext: "CV Access Granted",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Vault Unlocks",
      value: stats?.vaultUnlocks ?? 0,
      icon: Lock,
      subtext: "Private Vault Unlocked",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      label: "ECL Unlocks",
      value: stats?.eclUnlocks ?? 0,
      icon: BookOpen,
      subtext: "ECL Material Unlocked",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      label: "Contact Messages",
      value: stats?.contactSubmissions ?? 0,
      icon: Mail,
      subtext: "Pesan Masuk",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10"
    },
    {
      label: "Security Level",
      value: "HMAC-SHA256",
      icon: ShieldCheck,
      subtext: "Tamper-Proof Session Cookie",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Standar Top Header Card (Seragam 1:1) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 relative z-10">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none"
          >
            <ShieldCheck className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Ikhtisar & Performa Portofolio</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Monitoring real-time status proteksi, jumlah pengunjung, pembukaan akses, dan pesan masuk.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 p-1 sm:p-1.5">
        {cards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="premium-card group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-line bg-surface flex flex-col justify-between shadow-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform-gpu will-change-[transform,opacity]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted">{item.label}</span>
                <motion.div
                  whileHover={{ scale: 1.06, rotate: 6 }}
                  whileTap={{ scale: 0.94, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className={`icon-orbit grid h-10 w-10 place-items-center rounded-2xl border border-line ${item.bg} ${item.color} cursor-pointer select-none`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              </div>
              <div className="mt-4">
                <span className="font-display text-2xl sm:text-3xl font-black text-primary">
                  {item.value}
                </span>
                <p className="text-[11px] font-bold text-muted mt-1">{item.subtext}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
