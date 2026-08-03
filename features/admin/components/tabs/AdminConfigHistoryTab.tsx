"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, RotateCcw, Eye, ShieldCheck, Clock, AlertCircle, CheckCircle2, Hash, RefreshCw } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { ConfigSnapshot } from "@/services/admin/adminTypes";
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";

export function AdminConfigHistoryTab() {
  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [previewModal, setPreviewModal] = useState<ConfigSnapshot | null>(null);
  const [restoreModalConfig, setRestoreModalConfig] = useState<{
    open: boolean;
    version: number;
    action: () => Promise<void>;
  }>({
    open: false,
    version: 0,
    action: async () => {}
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/configuration/history");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.snapshots)) {
          setSnapshots(data.snapshots);
        }
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat histori konfigurasi." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRestore = (snapshot: ConfigSnapshot) => {
    setRestoreModalConfig({
      open: true,
      version: snapshot.version,
      action: async () => {
        try {
          const res = await fetch("/api/admin/configuration/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ version: snapshot.version })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setFeedback({
              type: "success",
              text: `Konfigurasi berhasil dipulihkan ke Snapshot v${snapshot.version}. Seluruh sesi publik telah dibatalkan secara otomatis.`
            });
            broadcastCrossTabEvent("CONFIG_RESTORED", { version: snapshot.version });
            fetchHistory();
          } else {
            setFeedback({ type: "error", text: data.error || "Gagal melakukan restore snapshot." });
          }
        } catch {
          setFeedback({ type: "error", text: "Terjadi kesalahan jaringan." });
        } finally {
          setRestoreModalConfig((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {feedback ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </motion.div>
      ) : null}

      <div className="premium-card p-6 rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
            >
              <History className="h-5 w-5" />
            </motion.div>
            <h3 className="font-display text-lg font-black text-primary">Histori Snapshot Konfigurasi (Max 50)</h3>
          </div>
          <span className="text-xs font-bold text-muted">
            {snapshots.length} Snapshot Tersimpan
          </span>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="premium-card rounded-3xl p-8 sm:p-12 border border-line bg-surface/60 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden my-4 shadow-card select-none"
          >
            {/* Glowing Spinning Orbit Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="icon-orbit grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-glow shadow-primary/20 relative z-10"
              >
                <RefreshCw className="h-7 w-7" />
              </motion.div>
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2 inline-block shadow-xs">
                Audit Engine System
              </span>
              <h4 className="font-display text-base font-black text-primary">
                Memuat Data Histori Snapshot...
              </h4>
              <p className="text-xs font-bold text-muted mt-1 max-w-sm">
                Menghubungkan ke basis data snapshot terenkripsi & memverifikasi integritas hash.
              </p>
            </div>

            {/* Animated Glowing Progress Bar */}
            <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden border border-line bg-surface/90 relative mt-1">
              <motion.div
                className="bg-gradient-to-r from-primary via-cyan-500 to-primary h-full rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : snapshots.length === 0 ? (
          <div className="empty-state">
            <History className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-muted">Belum ada snapshot konfigurasi yang tercatat.</p>
            <p className="text-[11px] font-medium text-muted mt-1">
              Snapshot akan dibuat secara otomatis saat terjadi perubahan konfigurasi.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {snapshots.map((item) => (
              <motion.div
                key={item.version}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card p-5 rounded-2xl border border-line bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      Version #{item.version}
                    </span>
                    <span className="text-xs font-black text-primary">{item.message}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-bold text-muted mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{item.createdBy}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(item.createdAt).toLocaleString("id-ID")}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] opacity-75">
                      <Hash className="h-3 w-3" />
                      <span>{item.configHash.slice(0, 12)}...</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <MagneticButton>
                    <button
                      type="button"
                      onClick={() => setPreviewModal(item)}
                      className="button-secondary px-3.5 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                  </MagneticButton>

                  <MagneticButton>
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      className="px-3.5 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot Preview Modal */}
      <AnimatePresence>
        {previewModal ? (
          <motion.div
            className="modal-backdrop fixed inset-0 z-[130] grid place-items-center px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={() => setPreviewModal(null)}
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
              className="premium-card w-full max-w-2xl max-h-[85vh] rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="icon-orbit grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black text-primary">
                      Preview Snapshot Version #{previewModal.version}
                    </h3>
                    <p className="text-xs font-bold text-muted mt-0.5">{previewModal.message}</p>
                  </div>
                </div>
                <MagneticButton>
                  <button
                    type="button"
                    onClick={() => setPreviewModal(null)}
                    className="button-secondary text-xs font-black px-4 py-2 rounded-2xl cursor-pointer"
                  >
                    Tutup
                  </button>
                </MagneticButton>
              </div>

              <div className="overflow-y-auto bg-black/40 p-4 rounded-2xl border border-line font-mono text-xs text-emerald-400">
                <pre>{JSON.stringify(previewModal.state, null, 2)}</pre>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        open={restoreModalConfig.open}
        title={`Restore ke Snapshot Version #${restoreModalConfig.version}?`}
        description="Tindakan ini akan mengembalikan seluruh keadaan konfigurasi (Password, Strategy, Toggle, Settings) ke versi tersebut dan membatalkan seluruh sesi publik secara global (Epoch update)."
        confirmLabel="Ya, Restore Sekarang"
        cancelLabel="Batal"
        onConfirm={restoreModalConfig.action}
        onCancel={() => setRestoreModalConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
