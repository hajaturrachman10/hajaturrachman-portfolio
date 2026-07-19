"use client";

import { motion } from "framer-motion";
import { ImageWithShimmer } from "@/components/ImageWithShimmer";
import { ExternalLink } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function AchievementsSection() {
  const { achievements } = useSiteData();
  const { language } = useLanguage();

  return (
    <Reveal id="achievements" className="container-page section-space">
      <SectionHeader
        eyebrow={language === "id" ? "Prestasi & Dokumen" : "Zertifikate & Erfolge"}
        title={language === "id" ? "Bukti perjalanan: kompetisi, organisasi, dan pelatihan." : "Zeugnisse des Lebensweges: Wettbewerbe, Organisationen und Schulungen."}
        description={language === "id"
          ? "Dokumentasi pencapaian akademis, kontribusi sosial, serta bukti kompetensi penting yang telah dicapai."
          : "Dokumentation akademischer Leistungen, sozialer Beiträge sowie wichtiger erworbener Kompetenzen."}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {achievements.map((item) => (
          <motion.article
            key={item.title}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl cursor-pointer select-none flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/11] overflow-hidden bg-primary/10">
                <ImageWithShimmer src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 hover:scale-105" />
                <div className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/88 px-3 py-1 text-xs font-black text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 dark:text-white">
                  {item.category === "Literasi"
                    ? (language === "id" ? "Literasi" : "Alphabetisierung")
                    : item.category === "Kompetisi"
                    ? (language === "id" ? "Kompetisi" : "Wettbewerb")
                    : item.category === "Akademik"
                    ? (language === "id" ? "Akademik" : "Akademisch")
                    : item.category === "Organisasi"
                    ? (language === "id" ? "Organisasi" : "Organisation")
                    : item.category === "Praktik"
                    ? (language === "id" ? "Praktik" : "Praxis")
                    : item.category === "Rekomendasi" || item.category === "Empfehlung"
                    ? (language === "id" ? "Rekomendasi" : "Empfehlung")
                    : (language === "id" ? "Pelatihan" : "Schulung")}{" "}
                  - {item.year}
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary animate-pulse">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-black leading-tight">{item.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
            {item.document ? (
              <div className="px-6 pb-6 pt-0">
                <motion.a
                  href={item.document}
                  whileTap={{ scale: 0.95 }}
                  className="button-secondary focus-ring w-full text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  {language === "id" ? "Lihat Dokumen" : "Dokument ansehen"}
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </div>
            ) : null}
          </motion.article>
        ))}
      </div>
    </Reveal>
  );
}
