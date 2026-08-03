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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-line bg-surface flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden shadow-card select-none"
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative">
          <div className="icon-orbit grid h-16 w-16 place-items-center rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20">
            <FileX className="h-7 w-7" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>

        <div>
          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider mb-2 bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <span>STATUS: {language === "id" ? "NONAKTIF SEMENTARA" : "VORÜBERGEHEND DEAKTIVIERT"}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-black text-rose-500">{docName}</h2>
        </div>

        {/* Warning card matching exact system alert */}
        <div className="flex gap-3 text-left p-4.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 max-w-md w-full relative z-10 shadow-glow shadow-rose-500/5">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-xs font-bold leading-5">
            {language === "id"
              ? "Dokumen ini saat ini ditangguhkan oleh administrator. Kami akan mengalihkan Anda secara otomatis begitu akses dipulihkan."
              : "Dieses Dokument ist vorübergehend deaktiviert. Sie werden automatisch weitergeleitet, sobald der Zugriff wiederhergestellt ist."}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
          <MagneticButton className="w-full sm:w-auto">
            <button
              onClick={() => router.push("/ecl-b2")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface hover:bg-slate-100 hover:text-primary transition-all duration-300 px-5 py-3 text-xs font-black w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "id" ? "Kembali ke Materi" : "Zurück zur Übersicht"}</span>
            </button>
          </MagneticButton>

          <MagneticButton className="w-full sm:w-auto">
            <motion.a
              href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                language === "id"
                  ? `Halo Hajat, saya ingin menanyakan akses dokumen: ${docNames.id}`
                  : `Hallo Hajat, ich möchte nach dem Zugriff auf das Dokument fragen: ${docNames.de}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3 text-xs font-black shadow-md shadow-emerald-600/20 border-0 w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{language === "id" ? "Hubungi via WhatsApp" : "Hajat kontaktieren"}</span>
            </motion.a>
          </MagneticButton>
        </div>
      </motion.div>
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
