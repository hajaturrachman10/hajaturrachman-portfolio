"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileX, ArrowLeft, MessageCircle, AlertTriangle, FileText } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/components/providers/LanguageContext";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";

type UnavailableCardProps = {
  docId: string;
  docNames: { id: string; de: string };
};

export function UnavailableCard({ docId, docNames }: UnavailableCardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const docName = language === "id" ? docNames.id : docNames.de;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${docName} — ${language === "id" ? "Akses Ditangguhkan" : "Zugriff Ausgesetzt"} | Hajaturrachman`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/ecl-b2");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [docName, language, router]);

  // Real-time tab sync and cross-device polling
  useEffect(() => {
    const handleRedirect = () => {
      const docUrls: Record<string, string> = {
        "1": "https://docs.google.com/document/d/1KHzF7IriKkR2p4oFFRq_XQx3IXHL6k5Dky1wp5c8HOo/edit?usp=sharing",
        "2": "https://docs.google.com/document/d/1h_Io7Tl451P8otFz5q_3nS7xyepxJ3FckjAvvW03U0U/edit?usp=sharing",
        "3": "https://docs.google.com/document/d/1JxCMWPL2n3fyJSYIZ3KVUFUbBdY8cdBc29Z6kO3YHLo/edit?usp=sharing"
      };
      const targetUrl = docUrls[docId] || "/ecl-b2";
      window.location.href = targetUrl;
    };

    // 1. Listen for cross-tab sync toggle events
    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (msg.event === "TOGGLE_CHANGED") {
        const togglesMap = msg.data?.togglesMap || msg.payload?.togglesMap;
        if (togglesMap) {
          const docKey = `ecl_doc${docId}` as keyof typeof togglesMap;
          if (togglesMap[docKey] === true) {
            handleRedirect();
          }
        }
      }
    });

    // 2. Poll server every 4 seconds to support cross-device synchronization (e.g. phone vs desktop)
    const checkServerStatus = async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          
          // Sync client-side toggles if available in response
          if (data.toggles) {
            syncLocalToggles(data.toggles, data.globalEpoch);
          }

          const docKey = `doc${docId}` as "doc1" | "doc2" | "doc3";
          if (data.docToggles?.[docKey] === true) {
            handleRedirect();
          }
        }
      } catch {
        // Ignore
      }
    };

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkServerStatus();
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [docId]);

  return (
    <div className="container-page flex flex-col items-center">
      {/* Harmonized Section Header */}
      <SectionHeader
        title={language === "id" ? "Akses Dokumen Ditangguhkan" : "Dokumentenzugriff Ausgesetzt"}
        description={
          language === "id"
            ? "Pemberitahuan resmi mengenai ketersediaan berkas pembelajaran ECL Deutsch B2."
            : "Offizielle Benachrichtigung über die Verfügbarkeit der ECL Deutsch B2 Lernunterlagen."
        }
        centered
      />

      {/* Central Card */}
      <Reveal className="max-w-2xl w-full mt-4 sm:mt-6">
        <motion.article
          initial={{ opacity: 0, y: 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card rounded-3xl p-6 sm:p-10 border border-line bg-surface flex flex-col items-center justify-center text-center gap-5 relative overflow-hidden shadow-card select-none w-full"
        >
          {/* Glowing Orbit Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-rose-500/20 blur-xl animate-pulse" />
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94, rotate: 3 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-16 w-16 place-items-center rounded-3xl border border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20 relative z-10"
            >
              <FileX className="h-8 w-8" />
            </motion.div>
          </div>

          <div className="w-full">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-3 inline-block">
              {language === "id" ? "STATUS: NONAKTIF SEMENTARA" : "STATUS: VORÜBERGEHEND DEAKTIVIERT"}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-primary">
              {language === "id" ? "Dokumen Tidak Dapat Diakses" : "Dokument zurzeit nicht verfügbar"}
            </h2>
            <div className="mt-3 p-3 rounded-2xl bg-surface/80 border border-line flex items-center justify-center gap-2 w-full">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-black text-primary truncate min-w-0">
                {docName}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold leading-relaxed text-muted w-full text-center">
            {language === "id"
              ? "Mohon maaf, dokumen ini sedang dinonaktifkan sementara oleh Administrator untuk pembaruan materi, revisi berkas, atau pemeliharaan sistem."
              : "Entschuldigung, dieses Dokument wurde vom Administrator vorübergehend für Aktualisierungen, Überarbeitungen oder Wartungsarbeiten deaktiviert."}
          </p>

          <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 text-left text-xs font-bold text-muted flex items-start gap-3 w-full">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {language === "id"
                ? "Silakan periksa kembali secara berkala atau hubungi Hajat jika Anda memerlukan akses mendesak. Kami akan mengalihkan Anda secara otomatis begitu akses dipulihkan."
                : "Bitte überprüfen Sie die Seite später erneut oder kontaktieren Sie Hajat per WhatsApp. Wir werden Sie automatisch weiterleiten, sobald der Zugriff wiederhergestellt ist."}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <MagneticButton className="flex-1">
              <button
                type="button"
                onClick={() => router.push("/ecl-b2")}
                className="button-secondary focus-ring w-full py-3 text-xs font-black flex items-center justify-center gap-2 rounded-2xl cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>{language === "id" ? "Kembali ke ECL B2" : "Zurück zu ECL B2"}</span>
              </button>
            </MagneticButton>

            <MagneticButton className="flex-1">
              <a
                href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                  language === "id"
                    ? `Halo Hajat, saya ingin menanyakan status akses ${docName} yang saat ini sedang nonaktif.`
                    : `Hallo Hajat, ich möchte nach dem Status von ${docName} fragen.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary focus-ring flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-4 py-3 text-xs font-black transition-colors duration-300 cursor-pointer select-none shadow-md shadow-emerald-600/10 w-full border-0"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span>{language === "id" ? "Tanya Hajat" : "Hajat Fragen"}</span>
              </a>
            </MagneticButton>
          </div>
        </motion.article>
      </Reveal>
    </div>
  );
}

// Client-side helper function to perform Conflict-Free Last-Write-Wins synchronization of admin toggles
function syncLocalToggles(serverToggles: any, serverEpoch: number) {
  if (typeof window === "undefined" || !serverToggles) return;
  
  const raw = localStorage.getItem("hajat_toggles_state");
  let localData: any = null;
  if (raw) {
    try {
      localData = JSON.parse(raw);
    } catch {
      localData = null;
    }
  }

  // Restructure legacy flat format if necessary
  if (localData && !localData.toggles) {
    localData = {
      toggles: Object.keys(localData).reduce((acc, key) => {
        acc[key] = { protected: localData[key], updatedAt: 0 };
        return acc;
      }, {} as any),
      globalEpoch: 0
    };
  }

  const merged = {
    toggles: { ...serverToggles },
    globalEpoch: Math.max(serverEpoch || 0, localData?.globalEpoch || 0)
  };

  if (localData?.toggles) {
    Object.keys(localData.toggles).forEach((key) => {
      const serverVal = serverToggles[key];
      const localVal = localData.toggles[key];
      if (serverVal && localVal) {
        const serverTime = Number(serverVal.updatedAt) || 0;
        const localTime = Number(localVal.updatedAt) || 0;
        
        if (localTime > serverTime) {
          merged.toggles[key] = {
            protected: localVal.protected,
            updatedAt: localTime
          };
        }
      }
    });
  }

  localStorage.setItem("hajat_toggles_state", JSON.stringify(merged));
  document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=31536000; SameSite=Lax`;
}
