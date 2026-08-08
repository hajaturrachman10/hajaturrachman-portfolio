"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FolderGit2, Compass, ShieldAlert } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/components/providers/LanguageContext";

export function NotFoundView() {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title =
        language === "de"
          ? "404 — Seite nicht gefunden | Hajaturrachman"
          : "404 — Halaman Tidak Ditemukan | Hajaturrachman";
    }
  }, [language]);

  return (
    <main className="pt-28 sm:pt-[7.5rem] pb-16 px-4 container-page min-h-[75vh] flex flex-col items-center justify-center relative">
      <Reveal className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Header Eyebrow & Title */}
        <SectionHeader
          eyebrow="404 — Page Not Found"
          title="Halaman Tidak Ditemukan"
          description="Alamat URL yang Anda tuju mungkin salah, telah dipindahkan, atau telah diperbarui dalam arsitektur portofolio v2.4.5."
          centered
        />

        {/* 404 Visual Hero Card Seragam 1:1 dengan Design System */}
        <div className="premium-card w-full p-6 sm:p-8 rounded-3xl border border-line bg-surface shadow-2xl relative overflow-hidden flex flex-col items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl sm:rounded-3xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none shadow-lg shadow-primary/10"
          >
            <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10" />
          </motion.div>

          <div className="space-y-2 text-center max-w-md">
            <span className="font-display text-4xl sm:text-5xl font-black text-primary tracking-tight block">
              404
            </span>
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-muted">
              Navigasi Anda terputus. Pilih salah satu tautan utama di bawah untuk kembali menjelajahi portofolio.
            </p>
          </div>

          {/* Quick Links Nav Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-2">
            <MagneticButton className="w-full">
              <Link
                href="/"
                className="button-primary focus-ring w-full py-3 px-4 text-xs font-black flex items-center justify-center gap-2 rounded-2xl select-none"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span>Beranda</span>
              </Link>
            </MagneticButton>

            <MagneticButton className="w-full">
              <Link
                href="/journey"
                className="button-secondary focus-ring w-full py-3 px-4 text-xs font-black flex items-center justify-center gap-2 rounded-2xl select-none"
              >
                <Compass className="h-4 w-4 shrink-0 text-primary" />
                <span>Cerita</span>
              </Link>
            </MagneticButton>

            <MagneticButton className="w-full">
              <Link
                href="/projects"
                className="button-secondary focus-ring w-full py-3 px-4 text-xs font-black flex items-center justify-center gap-2 rounded-2xl select-none"
              >
                <FolderGit2 className="h-4 w-4 shrink-0 text-primary" />
                <span>Proyek</span>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
