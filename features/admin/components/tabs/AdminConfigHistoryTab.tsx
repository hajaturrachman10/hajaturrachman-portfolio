"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, RotateCcw, Eye, ShieldCheck, Clock, AlertCircle, CheckCircle2, Hash, RefreshCw, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import dynamic from "next/dynamic";

const ConfirmModal = dynamic(
  () => import("@/components/modals/ConfirmModal").then((mod) => mod.ConfirmModal),
  { ssr: false }
);
import { ConfigSnapshot } from "@/services/admin/adminTypes";
import { broadcastCrossTabEvent, subscribeCrossTabSync } from "@/lib/crossTabSync";
import { toast } from "@/components/ui/Toast";

export function AdminConfigHistoryTab() {
  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const notify = (type: "success" | "error", text: string) => {
    toast({ message: text, type: type === "error" ? "error" : "success" });
  };

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
      notify("error", "Gagal memuat histori konfigurasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();

    const handleFocus = () => fetchHistory();
    window.addEventListener("focus", handleFocus);

    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (
        msg.event === "TOGGLE_CHANGED" ||
        msg.event === "CONFIG_RESTORED" ||
        msg.event === "CONFIG_UPDATED" ||
        msg.event === "STRATEGY_UPDATED" ||
        msg.event === "SNAPSHOT_CREATED"
      ) {
        fetchHistory();
      }
    });

    const interval = setInterval(fetchHistory, 5000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      unsubscribe();
      clearInterval(interval);
    };
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
            notify("success", `Konfigurasi berhasil dipulihkan ke Snapshot v${snapshot.version}. Seluruh sesi publik telah dibatalkan secara otomatis.`);
            broadcastCrossTabEvent("CONFIG_RESTORED", { version: snapshot.version });
            fetchHistory();
          } else {
            notify("error", data.error || "Gagal melakukan restore snapshot.");
          }
        } catch {
          notify("error", "Terjadi kesalahan jaringan.");
        } finally {
          setRestoreModalConfig((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

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
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none"
          >
            <History className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Histori Snapshot & Pemulihan</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Lihat snapshot konfigurasi sistem otomatis dan pulihkan ke versi sebelumnya kapan saja.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="premium-card p-6 rounded-3xl border border-line bg-surface"
      >
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
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="soft-card p-5 rounded-2xl border border-line bg-surface/50 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                    <div className="h-5 w-32 rounded skeleton-shimmer" />
                  </div>
                  <div className="h-4 w-28 rounded skeleton-shimmer hidden sm:block" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="h-8 rounded-xl skeleton-shimmer" />
                  <div className="h-8 rounded-xl skeleton-shimmer" />
                  <div className="h-8 rounded-xl skeleton-shimmer" />
                  <div className="h-8 rounded-xl skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : snapshots.length === 0 ? (
          <div className="empty-state">
            <History className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-muted">Belum ada snapshot konfigurasi yang tercatat.</p>
            <p className="text-[11px] font-medium text-muted mt-1">
              Snapshot akan dibuat secara otomatis saat terjadi perubahan konfigurasi.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-1">
            {snapshots.map((item, idx) => (
              <motion.div
                key={item.version}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="premium-card group p-5 rounded-2xl border border-line bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform-gpu will-change-[transform,opacity]"
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
      </motion.div>

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
    </motion.div>
  );
}
