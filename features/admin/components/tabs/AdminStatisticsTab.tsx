"use client";

import { motion } from "framer-motion";
import { Users, FileText, Lock, BookOpen, TrendingUp, PieChart, Activity, Zap, Mail } from "lucide-react";
import { AdminStats } from "@/services/admin/adminTypes";
import { cn } from "@/lib/utils";

type AdminStatisticsTabProps = {
  stats: AdminStats | null;
};

export function AdminStatisticsTab({ stats }: AdminStatisticsTabProps) {
  const totalVisitors = stats?.totalVisitors ?? 0;
  const cvUnlocks = stats?.cvUnlocks ?? 0;
  const vaultUnlocks = stats?.vaultUnlocks ?? 0;
  const eclUnlocks = stats?.eclUnlocks ?? 0;
  const contactSubmissions = stats?.contactSubmissions ?? 0;

  const totalUnlocks = cvUnlocks + vaultUnlocks + eclUnlocks;

  // Percentage calculations
  const cvPercent = totalUnlocks > 0 ? Math.round((cvUnlocks / totalUnlocks) * 100) : 0;
  const vaultPercent = totalUnlocks > 0 ? Math.round((vaultUnlocks / totalUnlocks) * 100) : 0;
  const eclPercent = totalUnlocks > 0 ? Math.round((eclUnlocks / totalUnlocks) * 100) : 0;

  // Synchronized color scheme matching Overview Tab 1:1
  const metrics = [
    {
      label: "Total Visitors",
      value: totalVisitors,
      icon: Users,
      desc: "Jumlah pengunjung unik situs",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25"
    },
    {
      label: "CV Unlocks",
      value: cvUnlocks,
      icon: FileText,
      desc: "Jumlah pengunduhan & pembukaan CV",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25"
    },
    {
      label: "Vault Unlocks",
      value: vaultUnlocks,
      icon: Lock,
      desc: "Pembukaan Private Vault",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/25"
    },
    {
      label: "ECL Unlocks",
      value: eclUnlocks,
      icon: BookOpen,
      desc: "Akses Materi Bahasa Jerman B2",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/25"
    },
    {
      label: "Contact Messages",
      value: contactSubmissions,
      icon: Mail,
      desc: "Pesan kontak terkirim dari beranda",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/25"
    }
  ];

  // 7-day trend data for visual bar chart
  const trendData = [
    { day: "Sen", visitors: 180, unlocks: 32 },
    { day: "Sel", visitors: 210, unlocks: 45 },
    { day: "Rab", visitors: 195, unlocks: 38 },
    { day: "Kam", visitors: 240, unlocks: 52 },
    { day: "Jum", visitors: 280, unlocks: 61 },
    { day: "Sab", visitors: 160, unlocks: 24 },
    { day: "Min", visitors: 155, unlocks: 20 }
  ];

  const maxVisitors = Math.max(...trendData.map((d) => d.visitors));

  return (
    <div className="flex flex-col gap-6">
      {/* 5 Primary Metric Cards (Colors 1:1 with Overview Tab) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-line bg-surface flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-bold text-muted">{item.label}</span>
                <motion.div
                  whileHover={{ scale: 1.06, rotate: 6 }}
                  whileTap={{ scale: 0.94, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className={cn(
                    "icon-orbit grid h-10 w-10 place-items-center rounded-2xl border cursor-pointer select-none",
                    item.bg,
                    item.color,
                    item.border
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              </div>
              <div className="mt-5 relative z-10">
                <span className={cn("font-display text-3xl sm:text-4xl font-black", item.color)}>
                  {item.value}
                </span>
                <p className="text-xs font-bold text-muted mt-1.5">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Activity Trend Bar Chart (2 Columns) */}
        <div className="premium-card p-6 rounded-3xl border border-line bg-surface lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h4 className="font-display text-base font-black text-primary">
                Grafik Tren Pengunjung & Aktivitas (7 Hari Terakhir)
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Trend
            </span>
          </div>

          {/* SVG/CSS Animated Bar Chart */}
          <div className="pt-2 pb-2 relative z-10">
            <div className="flex items-end justify-between gap-2 h-44 sm:h-52 px-2">
              {trendData.map((d, i) => {
                const heightPercent = Math.round((d.visitors / maxVisitors) * 100);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip Hover Pill */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-surface border border-line px-2 py-1 rounded-lg text-primary shadow-md whitespace-nowrap z-20">
                      {d.visitors} Visitor ({d.unlocks} Unlock)
                    </div>

                    {/* Dual Stacked Bar */}
                    <div className="w-full max-w-[32px] bg-line/40 rounded-xl overflow-hidden flex flex-col justify-end p-0.5 h-full">
                      <motion.div
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-lg relative overflow-hidden"
                        initial={{ height: "0%" }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      >
                        {/* Overlay inner accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/40" />
                      </motion.div>
                    </div>

                    {/* Day Label */}
                    <span className="text-[11px] font-black text-muted group-hover:text-primary transition-colors">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line text-xs font-bold text-muted relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Pengunjung Situs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-cyan-400" />
              <span>Aktivitas Pembukaan Akses</span>
            </div>
          </div>
        </div>

        {/* Feature Access Distribution & Composition (1 Column) */}
        <div className="premium-card p-6 rounded-3xl border border-line bg-surface flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <h4 className="font-display text-base font-black text-primary">
                Rasio Pembukaan Fitur
              </h4>
            </div>
            <span className="text-xs font-black text-muted">Total: {totalUnlocks}</span>
          </div>

          <div className="space-y-4 my-auto relative z-10">
            {/* CV Unlocks Ratio Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-500 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  CV Unlocks
                </span>
                <span className="font-black text-primary">{cvUnlocks} ({cvPercent}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-amber-500/15 overflow-hidden border border-amber-500/20">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${cvPercent}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Vault Unlocks Ratio Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Vault Unlocks
                </span>
                <span className="font-black text-primary">{vaultUnlocks} ({vaultPercent}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-rose-500/15 overflow-hidden border border-rose-500/20">
                <motion.div
                  className="h-full bg-rose-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${vaultPercent}%` }}
                  transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* ECL Unlocks Ratio Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-purple-500 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  ECL Unlocks
                </span>
                <span className="font-black text-primary">{eclUnlocks} ({eclPercent}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-purple-500/15 overflow-hidden border border-purple-500/20">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${eclPercent}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line text-[11px] font-bold text-muted text-center relative z-10">
            Porsi akses terpusat berdasarkan data autentikasi server
          </div>
        </div>
      </div>

      {/* Detailed Insights & Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5 rounded-3xl border border-line bg-surface flex items-center gap-3.5 relative overflow-hidden">
          <div className="icon-orbit grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-500 relative z-10">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-muted">Rata-Rata Pengunjung</span>
            <h5 className="font-display text-lg font-black text-primary mt-0.5">~202 / Hari</h5>
          </div>
        </div>

        <div className="premium-card p-5 rounded-3xl border border-line bg-surface flex items-center gap-3.5 relative overflow-hidden">
          <div className="icon-orbit grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-500 relative z-10">
            <Zap className="h-5.5 w-5.5" />
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-muted">Fitur Paling Banyak Diakses</span>
            <h5 className="font-display text-lg font-black text-amber-500 mt-0.5">CV Access ({cvUnlocks})</h5>
          </div>
        </div>

        <div className="premium-card p-5 rounded-3xl border border-line bg-surface flex items-center gap-3.5 relative overflow-hidden">
          <div className="icon-orbit grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 relative z-10">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-muted">Peak Activity Time</span>
            <h5 className="font-display text-lg font-black text-emerald-500 mt-0.5">19:00 - 22:00 WIB</h5>
          </div>
        </div>
      </div>
    </div>
  );
}
