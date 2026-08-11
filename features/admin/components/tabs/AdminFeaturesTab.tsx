"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Sparkles, ToggleLeft, ToggleRight, FileText, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FeatureType, FeatureToggleState } from "@/services/admin/adminTypes";
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

type AdminFeaturesTabProps = {
  toggles: Record<FeatureType, FeatureToggleState> | null;
  onRefresh: () => void;
};

export function AdminFeaturesTab({ toggles, onRefresh }: AdminFeaturesTabProps) {
  const [loadingFeature, setLoadingFeature] = useState<FeatureType | null>(null);
  const [transitioningAction, setTransitioningAction] = useState<"enabling" | "disabling" | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Partial<Record<FeatureType, boolean>>>({});

  // Clean synchronous rendering driven purely by server props (zero toggle jumps)

  const featuresList: Array<{ type: FeatureType; name: string; description: string; isDoc?: boolean }> = [
    {
      type: "cv",
      name: "Proteksi Curriculum Vitae (CV)",
      description: "Mengontrol perlindungan kata sandi untuk melihat dokumen CV Hajaturrachman."
    },
    {
      type: "vault",
      name: "Proteksi Private Vault",
      description: "Mengontrol perlindungan kata sandi untuk ruang personal dan data sensitif."
    },
    {
      type: "ecl",
      name: "Proteksi ECL Deutsch B2 Material",
      description: "Mengontrol perlindungan kata sandi untuk bahan belajar ujian bahasa Jerman."
    },
    {
      type: "ecl_doc1",
      name: "ECL Dokumen 1 — Kumpulan Contoh Soal Ujian",
      description: "Status akses Dokumen 1 (Aktif = Buka Google Docs, Nonaktif = Halaman Penutupan).",
      isDoc: true
    },
    {
      type: "ecl_doc2",
      name: "ECL Dokumen 2 — Bocoran Membaca, Menulis & Mendengar",
      description: "Status akses Dokumen 2 (Aktif = Buka Google Docs, Nonaktif = Halaman Penutupan).",
      isDoc: true
    },
    {
      type: "ecl_doc3",
      name: "ECL Dokumen 3 — Wahyu Ilahi Agustus 2026",
      description: "Status akses Dokumen 3 (Aktif = Buka Google Docs, Nonaktif = Halaman Penutupan).",
      isDoc: true
    }
  ];

  const handleToggle = async (feature: FeatureType, currentStatus: boolean) => {
    const isDocFeature = feature.startsWith("ecl_doc");
    // For main features: turning protected ON (currentStatus = false -> true) is "enabling protection".
    // For doc features: turning protected OFF (currentStatus = true -> false) is "enabling document".
    const isEnablingAction = isDocFeature ? currentStatus === true : !currentStatus;
    setLoadingFeature(feature);
    setTransitioningAction(isEnablingAction ? "enabling" : "disabling");

    // Comfortable 400ms micro-delay for smooth progress bar transition
    await new Promise((resolve) => setTimeout(resolve, 400));


    try {
      // 1. Send API patch request
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, protected: !currentStatus })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 2. Instantly update local state under overlay so card swaps state IMMEDIATELY
        setLocalOverrides((prev) => ({ ...prev, [feature]: !currentStatus }));

        if (data.togglesMap) {
          try {
            localStorage.setItem("hajat_toggles_state", JSON.stringify(data.togglesMap));
            document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(data.togglesMap))}; path=/; max-age=31536000; SameSite=Lax`;
          } catch {
            // Ignore
          }
        }

        const toastActionText = isDocFeature
          ? (!currentStatus ? "DIPERBARUI JADI NONAKTIF" : "DIPERBARUI JADI AKTIF")
          : (!currentStatus ? "DIPROTEKSI DENGAN SANDI" : "DIBUKA UNTUK PUBLIK");

        toast({
          message: `Fitur ${feature.toUpperCase()} berhasil ${toastActionText}`,
          type: isEnablingAction ? "indigo" : "cyan"
        });

        // 3. Broadcast event & trigger server refresh
        // For main features: unlocked = !currentStatus (was protected, now open)
        // For doc features: currentStatus=isProtected=true means locked. After toggle we OPEN it.
        //   new protected=false, so unlocked=true. But since we send !currentStatus to protected,
        //   the unlocked state = !(!currentStatus) = currentStatus for docs.
        const isUnlockedForPublic = isDocFeature ? currentStatus : !currentStatus;

        broadcastCrossTabEvent("TOGGLE_CHANGED", {
          feature,
          unlocked: isUnlockedForPublic,
          protected: !isUnlockedForPublic,
          togglesMap: data.togglesMap,
          timestamp: Date.now()
        });
        onRefresh();

        // 4. Comfortable grace delay (1100ms) so progress bar reaches 100% before overlay fades out
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    } catch {
      // Handle error silently
    } finally {
      // 5. Cleanly fade out overlay AFTER card state is 100% updated underneath
      setLoadingFeature(null);
      setTransitioningAction(null);
    }
  };

  const mainFeatures = featuresList.filter((f) => !f.isDoc);
  const docFeatures = featuresList.filter((f) => f.isDoc);

  const renderCard = (item: typeof featuresList[0], idx: number = 0) => {
    const isProtected = localOverrides[item.type] !== undefined
      ? localOverrides[item.type]!
      : toggles ? toggles[item.type]?.protected ?? true : true;
    const isLoading = loadingFeature === item.type;
    const isActiveOrProtected = item.isDoc ? !isProtected : isProtected;

    return (
      <motion.div
        key={item.type}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className="premium-card group relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-line bg-surface flex flex-col justify-between gap-4 sm:gap-6 shadow-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform-gpu will-change-[transform,opacity] overflow-hidden"
      >
        {/* In-Card Transition Animation Overlay (Non-fullscreen) */}
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3"
            >
              <div
                className={`grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl border ${
                  transitioningAction === "enabling"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-glow shadow-emerald-500/20"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20"
                }`}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
                  className="inline-flex shrink-0"
                >
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>
              </div>

              <div>
                <div
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider mb-1 ${
                    transitioningAction === "enabling"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  }`}
                >
                  <span>SINKRONISASI</span>
                </div>
                <h4
                  className={`font-display text-xs sm:text-sm font-black ${
                    transitioningAction === "enabling" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {item.isDoc
                    ? (transitioningAction === "enabling" ? "Mengaktifkan Dokumen..." : "Menonaktifkan Dokumen...")
                    : (transitioningAction === "enabling" ? "Menerapkan Proteksi..." : "Membuka Akses Publik...")}
                </h4>
              </div>

              <div
                className={`w-full max-w-[140px] sm:max-w-[160px] h-1.5 rounded-full overflow-hidden border ${
                  transitioningAction === "enabling"
                    ? "bg-emerald-500/15 border-emerald-500/20"
                    : "bg-rose-500/15 border-rose-500/20"
                }`}
              >
                <motion.div
                  className={
                    transitioningAction === "enabling"
                      ? "bg-emerald-500 h-full rounded-full"
                      : "bg-rose-500 h-full rounded-full"
                  }
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className={`icon-orbit grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl border ${
                isActiveOrProtected
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                  : "border-rose-500/25 bg-rose-500/10 text-rose-500"
              } cursor-pointer select-none`}
            >
              {isActiveOrProtected ? <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" /> : <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />}
            </motion.div>

            <span
              className={`px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                isActiveOrProtected
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {item.isDoc
                ? (isProtected ? "Dokumen Nonaktif" : "Dokumen Aktif")
                : (isProtected ? "Proteksi Aktif" : "Proteksi Nonaktif")}
            </span>
          </div>

          <h3 className="font-display text-base sm:text-lg font-black text-text mt-0.5">{item.name}</h3>
          <p className="text-xs font-bold text-muted leading-relaxed sm:leading-5">{item.description}</p>
        </div>

        <div className="pt-4 border-t border-line w-full">
          <MagneticButton className="w-full">
            <motion.button
              type="button"
              disabled={isLoading}
              onClick={() => handleToggle(item.type, isProtected)}
              whileHover="hover"
              whileTap="press"
              variants={{
                hover: { scale: 1.02, y: -2 },
                press: { scale: 0.97 }
              }}
              transition={{ type: "spring", stiffness: 380, damping: 12 }}
              className={cn(
                "button-primary focus-ring w-full py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-0 select-none cursor-pointer disabled:opacity-50",
                isActiveOrProtected
                  ? "!bg-none !bg-rose-600 hover:!bg-rose-500 active:!bg-rose-700 !text-white shadow-md shadow-rose-600/20"
                  : "!bg-none !bg-emerald-600 hover:!bg-emerald-500 active:!bg-emerald-700 !text-white shadow-md shadow-emerald-600/20"
              )}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              ) : isActiveOrProtected ? (
                <ToggleRight className="h-4 w-4 shrink-0" />
              ) : (
                <ToggleLeft className="h-4 w-4 shrink-0" />
              )}
              <span>
                {item.isDoc
                  ? (isProtected ? "Aktifkan Dokumen" : "Nonaktifkan Dokumen")
                  : (isProtected ? "Matikan Proteksi" : "Aktifkan Proteksi")}
              </span>
            </motion.button>
          </MagneticButton>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 w-full"
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
            <ToggleLeft className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Sakelar Proteksi Fitur</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Aktifkan atau nonaktifkan sistem proteksi kata sandi publik secara instan.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Group 1: Halaman & Fitur Utama */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-line pb-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xs sm:text-sm font-black text-primary uppercase tracking-wider">
            Akses Proteksi Halaman & Fitur Utama
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-1 sm:p-1.5">
          {mainFeatures.map((item, idx) => renderCard(item, idx))}
        </div>
      </div>

      {/* Group 2: Berkas & Dokumen ECL */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-line pb-2.5">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xs sm:text-sm font-black text-primary uppercase tracking-wider">
            Status Akses Berkas & Dokumen ECL
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-1 sm:p-1.5">
          {docFeatures.map((item, idx) => renderCard(item, idx + mainFeatures.length))}
        </div>
      </div>
    </motion.div>
  );
}
