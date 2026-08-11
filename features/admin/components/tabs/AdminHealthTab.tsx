"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Activity, Server, FileCode, Shield } from "lucide-react";
import { SystemHealthReport } from "@/services/admin/adminHealthService";

type AdminHealthTabProps = {
  health: SystemHealthReport | null;
};

export function AdminHealthTab({ health }: AdminHealthTabProps) {
  if (!health) {
    return (
      <div className="premium-card p-6 rounded-3xl border border-line bg-surface text-center">
        <p className="text-xs font-bold text-muted">Memuat data kesehatan sistem...</p>
      </div>
    );
  }

  const items = [
    { label: "Repository Readable", pass: health.checks.repositoryReadable, desc: "Pembacaan data adminState.json" },
    { label: "Repository Writable", pass: health.checks.repositoryWritable, desc: "Penulisan data penyimpanan server" },
    { label: "Admin State Valid", pass: health.checks.adminStateValid, desc: "Integritas struktur data akun" },
    { label: "Cookie Secret Available", pass: health.checks.cookieSecretAvailable, desc: "Kunci rahasia HMAC-SHA256" },
    { label: "Environment Valid", pass: health.checks.environmentValid, desc: "Variabel lingkungan NODE_ENV" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6"
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
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 cursor-pointer select-none"
          >
            <Activity className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Kesehatan & Performa Sistem</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              {health.build} — {health.runtime}
            </p>
          </div>
        </div>

        <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider shrink-0">
          {health.status}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((check, idx) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -3, scale: 1.005 }}
            transition={{ duration: 0.35, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card p-5 rounded-2xl border border-line bg-surface flex items-center justify-between"
          >
            <div>
              <h4 className="font-display text-sm font-black text-primary">{check.label}</h4>
              <p className="text-[11px] font-bold text-muted mt-0.5">{check.desc}</p>
            </div>
            {check.pass ? (
              <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>PASS</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                <XCircle className="h-5 w-5" />
                <span>FAIL</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
