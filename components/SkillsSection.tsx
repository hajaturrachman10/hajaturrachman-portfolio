"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function SkillsSection() {
  const { skillGroups } = useSiteData();
  const { language } = useLanguage();

  return (
    <Reveal id="skills" className="container-page section-space">
      <SectionHeader
        eyebrow={language === "id" ? "Keterampilan" : "Fähigkeiten"}
        title={language === "id" ? "Keterampilan yang relevan untuk belajar, bekerja, dan berkarya." : "Relevante Fähigkeiten für Studium, Arbeit und Projekte."}
        description={language === "id"
          ? "Pemetaan kompetensi dasar, penguasaan bahasa, keterampilan kreatif, serta tata kelola organisasi."
          : "Kompetenzbereiche, Sprachkenntnisse, kreative Fähigkeiten und organisatorische Führung."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {skillGroups.map((group) => (
          <motion.article
            key={group.title}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className="premium-card rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-6 cursor-pointer select-none flex flex-col justify-between h-full"
          >
            <div>
              <div className="mb-6 flex items-center gap-3">
                <motion.div
                  whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                  className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
                >
                  <group.icon className="h-6 w-6 animate-pulse" />
                </motion.div>
                <h3 className="font-display text-lg font-black">{group.title}</h3>
              </div>

              <div className="space-y-5">
                {group.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{skill.name}</p>
                        <p className="mt-0.5 text-xs font-bold text-muted">
                          {skill.note}
                        </p>
                      </div>
                      <span className="text-xs font-black text-primary animate-pulse">
                        {skill.level}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-line/80">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </Reveal>
  );
}
