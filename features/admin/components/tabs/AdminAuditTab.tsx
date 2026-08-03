"use client";

import { motion } from "framer-motion";
import { ListFilter, Clock, Activity } from "lucide-react";

export function AdminAuditTab() {
  const auditLogs = [
    { event: "LOGIN_SUCCESS", desc: "Administrator login berhasil via cookie admin_session", time: "Baru saja" },
    { event: "TOGGLE_CHANGED", desc: "Status proteksi fitur divalidasi via Admin Toggle Service", time: "1 jam lalu" },
    { event: "SESSION_REVOKED", desc: "Global Epoch diperbarui untuk pembatalan sesi publik", time: "3 jam lalu" },
    { event: "LOCKOUT_RESET", desc: "Pembekuan rate limit IP berhasil di-reset", time: "5 jam lalu" },
    { event: "SYSTEM_INITIALIZED", desc: "Sistem Admin Control Center v2.2 aktif", time: "1 hari lalu" }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Standar Top Header Card (Seragam 1:1) */}
      <div className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none"
          >
            <ListFilter className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Audit Log Sistem</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Security Audit
              </span>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Rekam jejak real-time seluruh aktivitas penting dan peristiwa sistem admin.
            </p>
          </div>
        </div>
      </div>

      <div className="premium-card p-6 rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
            >
              <ListFilter className="h-5 w-5" />
            </motion.div>
            <h3 className="font-display text-lg font-black text-primary">Daftar Audit Log Sistem</h3>
          </div>
          <span className="text-xs font-bold text-muted">5 Event Terbaru</span>
        </div>

        <div className="flex flex-col gap-3">
          {auditLogs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="soft-card p-4 rounded-2xl border border-line bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="icon-orbit grid h-9 w-9 place-items-center rounded-xl border border-line bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-primary">{log.event}</span>
                  <p className="text-[11px] font-bold text-muted mt-0.5">{log.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-muted text-[11px] font-bold shrink-0 self-end sm:self-auto">
                <Clock className="h-3.5 w-3.5" />
                <span>{log.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
