"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CVAccessSection } from "@/components/CVAccessSection";
import { MagneticButton } from "@/components/MagneticButton";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function JourneySection() {
  const { siteConfig, journeyCards, featureHighlights } = useSiteData();
  const { language } = useLanguage();
  return (
    <Reveal id="journey" className="container-page section-space pt-0 overflow-hidden">
      <SectionHeader
        eyebrow={language === "id" ? "Cerita & Arah Hidup" : "Lebensweg & Werte"}
        title={language === "id" ? "Lebih dari portofolio: ini adalah peta perjalanan Hajaturrachman." : "Mehr als ein Portfolio: Dies ist die Lebenskarte von Hajaturrachman."}
        description={language === "id" ? "Bagian ini menampilkan sisi personal yang tetap aman untuk publik: asal perjalanan, arah Jerman, mimpi keliling dunia, dan nilai yang sedang dibangun." : "Dieser Bereich zeigt persönliche Aspekte: meine Herkunft, den Weg nach Deutschland, Träume von Weltreisen und erlernte Werte."}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-card overflow-hidden rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-7 lg:p-8">
          <div className="relative">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/14 blur-3xl" />
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
              {language === "id" ? "Prinsip Perjalanan Hidup" : "Persönliches Manifest"}
            </p>
            <h3 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              {language === "id" ? "Mewujudkan Karir Global Melalui Disiplin & Komitmen" : "Realisierung einer globalen Karriere durch Disziplin & Engagement"}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {language === "id"
                ? "Pengembangan diri bagi saya adalah proses berkelanjutan. Melalui penguasaan bahasa Jerman, ketahanan mental, serta pemahaman budaya asing, saya siap memberikan kontribusi terbaik di bidang keperawatan global."
                : "Persönliche Entwicklung ist für mich ein kontinuierlicher Prozess. Durch den Erwerb der deutschen Sprache, mentale Stärke und interkulturelles Verständnis bin ich bereit, einen bestmöglichen Beitrag in der globalen Pflege zu leisten."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {siteConfig.focus.map((item) => (
                <motion.span
                  key={item}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -1 }}
                  className="rounded-full border border-line bg-surface/80 px-4 py-2 text-sm font-black text-muted cursor-pointer select-none transition hover:border-primary/45"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {journeyCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              className="premium-card rounded-4xl p-5 cursor-pointer select-none"
            >
              <div className="flex gap-4">
                <MagneticButton className="shrink-0">
                  <motion.div
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.08, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
                      press: { scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                  >
                    <card.icon className="h-6 w-6" />
                  </motion.div>
                </MagneticButton>
                <div>
                  <h3 className="font-display text-lg font-black">
                    {card.title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted">{card.text}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <CVAccessSection />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featureHighlights.map((feature) => (
          <motion.div
            key={feature.title}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="premium-card rounded-4xl p-5 cursor-pointer select-none"
          >
            <MagneticButton className="w-fit">
              <motion.div
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.08, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
                  press: { scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }
                }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
              >
                <feature.icon className="h-6 w-6" />
              </motion.div>
            </MagneticButton>
            <h3 className="mt-5 font-display text-lg font-black">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {feature.text}
            </p>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}
