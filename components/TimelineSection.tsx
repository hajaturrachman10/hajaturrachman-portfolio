"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function TimelineSection() {
  const { timeline } = useSiteData();
  const { language } = useLanguage();

  return (
    <Reveal id="timeline" className="container-page section-space overflow-hidden">
      <SectionHeader
        eyebrow={language === "id" ? "Pendidikan & Pengalaman" : "Bildung & Erfahrung"}
        title={language === "id" ? "Rekam jejak yang membentuk profil saya sampai hari ini." : "Zeitleiste, die mein Profil bis heute geprägt hat."}
        description={language === "id"
          ? "Bagian ini menampilkan pendidikan, persiapan Jerman, organisasi, literasi, riset, dan pengalaman promosi."
          : "Dieser Bereich zeigt meinen Bildungsweg, meine Deutschvorbereitung, organisatorische Arbeit und Projekterfahrung."}
      />

      <div className="relative">
        <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-secondary to-accent sm:block" />

        <div className="grid gap-5">
          {timeline.map((item) => (
            <motion.article
              key={`${item.title}-${item.organization}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.995 }}
              className="premium-card relative rounded-4xl p-6 sm:ml-12 sm:p-7 cursor-pointer select-none h-full flex flex-col justify-between"
            >
              <div>
                <div className="icon-orbit absolute -left-[3.25rem] top-7 hidden h-9 w-9 place-items-center rounded-full border border-line bg-surface text-primary shadow-card sm:grid">
                  <item.icon className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-primary">{item.title}</p>
                    <h3 className="mt-1 font-display text-xl font-black">
                      {item.organization}
                    </h3>
                  </div>

                  <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    {item.period}
                  </span>
                </div>

                <p className="mt-4 leading-8 text-muted">{item.description}</p>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                {item.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl sm:rounded-3xl border border-line bg-surface/80 p-3 sm:p-4 flex sm:flex-col justify-start sm:justify-between items-center sm:items-start gap-2.5 sm:gap-0"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5 sm:mb-3 text-primary animate-pulse shrink-0" />
                    <p className="text-xs sm:text-sm font-bold leading-5 sm:leading-6 text-muted">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
