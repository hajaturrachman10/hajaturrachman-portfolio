"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileX, ArrowLeft, MessageCircle, AlertTriangle, FileText } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/components/providers/LanguageContext";

const DOC_NAMES: Record<string, { id: string; de: string }> = {
  "1": {
    id: "Dokumen 1 — Kumpulan Contoh Soal Ujian ECL B2",
    de: "Dokument 1 — ECL B2 Beispielaufgaben Sammlung"
  },
  "2": {
    id: "Dokumen 2 — Bocoran Membaca, Menulis & Mendengar B2",
    de: "Dokument 2 — B2 Lesen, Schreiben & Hören Vorbereitung"
  },
  "3": {
    id: "Dokumen 3 — Wahyu Ilahi ECL B2 Agustus 2026",
    de: "Dokument 3 — Wahyu Ilahi ECL B2 August 2026"
  }
};

export default function DocumentUnavailablePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const docId = searchParams.get("doc") || "1";
  const docObj = DOC_NAMES[docId] || {
    id: "Dokumen ECL Deutsch B2",
    de: "ECL Deutsch B2 Dokument"
  };
  const docName = language === "id" ? docObj.id : docObj.de;

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

  return (
    <main className="pt-28 sm:pt-[7rem] pb-16 min-h-[calc(100vh-140px)] flex flex-col justify-center">
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

        {/* Central Card Harmonized 1:1 with Portfolio Design System */}
        <Reveal className="max-w-2xl w-full mt-4 sm:mt-6">
          <motion.article
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-line bg-surface flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden shadow-card select-none"
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

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-3 inline-block shadow-xs">
                {language === "id" ? "STATUS: NONAKTIF SEMENTARA" : "STATUS: VORÜBERGEHEND DEAKTIVIERT"}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-primary">
                {language === "id" ? "Dokumen Tidak Dapat Diakses" : "Dokument zurzeit nicht verfügbar"}
              </h2>
              <div className="mt-3 p-3.5 rounded-2xl bg-surface/80 border border-line flex items-center justify-center gap-2.5 max-w-md mx-auto">
                <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-black text-primary truncate">
                  {docName}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold leading-relaxed text-muted max-w-lg">
              {language === "id"
                ? "Mohon maaf, dokumen ini sedang dinonaktifkan sementara oleh Administrator untuk pembaruan materi, revisi berkas, atau pemeliharaan sistem."
                : "Entschuldigung, dieses Dokument wurde vom Administrator vorübergehend für Aktualisierungen, Überarbeitungen oder Wartungsarbeiten deaktiviert."}
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 text-left text-xs font-bold text-muted flex items-start gap-3 max-w-lg w-full">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {language === "id"
                  ? "Silakan periksa kembali secara berkala atau hubungi Hajat via WhatsApp jika Anda memerlukan akses dokumen secara mendesak."
                  : "Bitte überprüfen Sie die Seite später erneut oder kontaktieren Sie Hajat per WhatsApp, falls Sie dringenden Zugriff benötigen."}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-lg mt-2">
              <MagneticButton className="flex-1">
                <button
                  type="button"
                  onClick={() => router.push("/ecl-b2")}
                  aria-label={language === "id" ? "Kembali ke halaman materi ECL B2" : "Zurück zur ECL B2 Materialseite"}
                  className="button-secondary focus-ring w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 rounded-2xl cursor-pointer"
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
                  aria-label={language === "id" ? "Hubungi Hajat via WhatsApp" : "Hajat via WhatsApp kontaktieren"}
                  className="button-primary focus-ring flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 py-3.5 text-xs font-black transition-colors duration-300 cursor-pointer select-none shadow-md shadow-emerald-600/10 w-full border-0"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>{language === "id" ? "Tanya Hajat" : "Hajat Fragen"}</span>
                </a>
              </MagneticButton>
            </div>
          </motion.article>
        </Reveal>
      </div>
    </main>
  );
}
