"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MagneticButton } from "@/components/MagneticButton";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Typewriter } from "@/components/Typewriter";
import { LocationBadges } from "@/components/LocationBadges";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function HeroSection() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const floatingLabels = language === "id"
    ? ["Bahasa Jerman B2", "Ausbildung Keperawatan", "Keperawatan", "Impian Dunia"]
    : ["Deutsch B2", "Pflege-Ausbildung", "Krankenpflege", "Traum von Weltreise"];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section
        id="home"
        className="relative isolate flex min-h-screen items-center overflow-hidden pb-16 pt-28 sm:pt-[7.5rem]"
      >
        <ParticleBackground />
        <div className="container-page flex flex-col justify-center gap-8">
          {/* Top Columns Grid */}
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] w-full">
            <div style={{ opacity: 1 }}>
              <h1 className="display-title mt-0 max-w-5xl break-words">
                {language === "id" ? "Halo, saya" : "Hallo, ich bin"}
                <br className="sm:hidden" />{" "}
                <span className="gradient-text inline-block">{siteConfig.name}</span>
              </h1>
              <div className="mt-3 text-base font-black tracking-tight text-text sm:text-2xl min-h-[48px] xs:min-h-[44px] sm:min-h-[40px] flex items-center">
                <Typewriter
                  words={[
                    ...siteConfig.headline.split(" | "),
                    language === "id" ? "Pembelajar Bahasa Jerman" : "Deutschlernender",
                    language === "id" ? "Pembuat Proyek Kreatif" : "Kreativer Projektentwickler",
                    language === "id" ? "Calon Perawat di Jerman" : "Zukünftige Pflegekraft in DE",
                    language === "id" ? "Calon Penjelajah Dunia" : "Zukünftiger Weltreisender"
                  ]}
                />
              </div>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {siteConfig.bio}
              </p>
              <LocationBadges />
            </div>
            <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] animate-pulse" style={{ opacity: 1 }}>
              <div className="premium-card relative overflow-hidden rounded-[3rem] p-4 cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950">
                  <Image
                    src={siteConfig.profileImage}
                    alt={`Foto profil ${siteConfig.name}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 88vw, 24rem"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 w-full mt-4 lg:mt-6">
            {siteConfig.stats.map((stat) => (
              <div key={stat.label} className="premium-card rounded-3xl p-4 text-center cursor-pointer select-none">
                <div className="icon-orbit mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5 animate-pulse" />
                </div>
                <div className="font-display text-2xl font-black gradient-text">{stat.value}</div>
                <div className="mt-1 text-xs font-black text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden pb-16 pt-28 sm:pt-[7.5rem]"
    >
      <ParticleBackground />

      <div className="container-page flex flex-col justify-center gap-8">
        {/* Top Columns Grid */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] w-full">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="display-title mt-0 max-w-5xl break-words">
              {language === "id" ? "Halo, saya" : "Hallo, ich bin"}
              <br className="sm:hidden" />{" "}
              <span className="gradient-text inline-block">{siteConfig.name}</span>
            </h1>

            <div className="mt-3 text-base font-black tracking-tight text-text sm:text-2xl min-h-[48px] xs:min-h-[44px] sm:min-h-[40px] flex items-center">
              <Typewriter
                words={[
                  ...siteConfig.headline.split(" | "),
                  language === "id" ? "Pembelajar Bahasa Jerman" : "Deutschlernender",
                  language === "id" ? "Pembuat Proyek Kreatif" : "Kreativer Projektentwickler",
                  language === "id" ? "Calon Perawat di Jerman" : "Zukünftige Pflegekraft in DE",
                  language === "id" ? "Calon Penjelajah Dunia" : "Zukünftiger Weltreisender"
                ]}
              />
            </div>

            <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {siteConfig.bio}
            </p>

            <LocationBadges />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 34 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]"
          >
            <motion.div
              className="absolute -inset-5 -z-10 rounded-[3.2rem] bg-gradient-to-br from-primary/24 via-secondary/12 to-accent/18 blur-2xl"
              animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className="premium-card relative overflow-hidden rounded-[3rem] p-4 cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950">
                <Image
                  src={siteConfig.profileImage}
                  alt={`Foto profil ${siteConfig.name}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 88vw, 24rem"
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-7 left-7 right-7 rounded-3xl border border-line/80 bg-surface/90 p-4 shadow-card backdrop-blur-2xl">
                <p className="font-display text-base font-black">{siteConfig.name}</p>
                <p className="mt-1 text-xs font-bold text-muted">
                  {siteConfig.headline}
                </p>
              </div>
            </motion.div>

            {floatingLabels.map((label, index) => (
              <motion.div
                key={label}
                animate={{ y: [0, -14, 0], rotate: [0, index % 2 ? 1.2 : -1.2, 0] }}
                transition={{
                  duration: 4.3 + index * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                className="premium-card absolute hidden rounded-full px-4 py-2 text-xs font-black text-text sm:block"
                style={{
                  top: `${12 + index * 20}%`,
                  left: index % 2 === 0 ? "-8%" : "76%"
                }}
              >
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 w-full mt-4 lg:mt-6"
        >
          {siteConfig.stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className="premium-card rounded-3xl p-4 text-center cursor-pointer select-none"
            >
              <div
                className="icon-orbit mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6"
              >
                <stat.icon className="h-5 w-5 animate-pulse" />
              </div>
              <div className="font-display text-2xl font-black gradient-text">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-black text-muted">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
