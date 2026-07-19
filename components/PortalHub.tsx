"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Film, Image as ImageIcon, Lock, Languages } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/components/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";

const MotionLink = motion(Link);

export function PortalHub() {
  const { language } = useLanguage();

  const chapters = [
    {
      title: language === "id" ? "Cerita & Arah Hidup" : "Lebensweg & Werte",
      subtitle: language === "id" ? "Manifesto & Karakter" : "Manifest & Charakter",
      description: language === "id" 
        ? "Asal-usul perjalanan, persiapan karir perawat di Jerman, dan manifesto nilai hidup." 
        : "Meine Herkunft, Ausbildungsvorbereitung in Deutschland und persönliches Werte-Manifest.",
      href: "/journey",
      icon: BookOpen,
      color: "from-blue-500/20 to-indigo-500/20",
      textColor: "text-blue-500",
      badge: null
    },
    {
      title: language === "id" ? "Karya & Proyek" : "Werke & Projekte",
      subtitle: language === "id" ? "Riset, Film & Literasi" : "Forschung, Film & Literatur",
      description: language === "id" 
        ? "Karya film pendek Manuskrip, karya tulis riset ilmiah, dan sertifikat prestasi tata boga." 
        : "Kurzfilmproduktionen, wissenschaftliche Forschungsarbeiten und andere schulische Projekte.",
      href: "/projects",
      icon: Film,
      color: "from-emerald-500/20 to-teal-500/20",
      textColor: "text-emerald-500",
      badge: null
    },
    {
      title: language === "id" ? "Galeri Kenangan" : "Galerie & Medien",
      subtitle: language === "id" ? "Dokumentasi Visual" : "Visuelle Dokumentation",
      description: language === "id" 
        ? "Kumpulan foto kenangan kegiatan, kawan, dan arsip visual perjalanan." 
        : "Sammlung von Fotos, Unterrichtsmomenten, Schulzeit und Visualisierungen von Träumen.",
      href: "/gallery",
      icon: ImageIcon,
      color: "from-pink-500/20 to-rose-500/20",
      textColor: "text-pink-500",
      badge: null
    },
    {
      title: language === "id" ? "Ruang Personal" : "Privater Bereich",
      subtitle: language === "id" ? "Kenangan Terproteksi" : "Geschützte Erinnerungen",
      description: language === "id" 
        ? "Cerita dan kenangan intim khusus keluarga, teman terdekat, dan pacar." 
        : "Persönliche Geschichten und geschützte Fotogalerien für Familie und enge Freunde.",
      href: "/private",
      icon: Lock,
      color: "from-purple-500/20 to-fuchsia-500/20",
      textColor: "text-purple-500",
      badge: language === "id" ? "Kata Sandi" : "Passwort"
    },
    {
      title: language === "id" ? "Materi ECL Deutsch B2" : "ECL Deutsch B2 Unterlagen",
      subtitle: language === "id" ? "Persiapan Ausbildung" : "Ausbildungsvorbereitung",
      description: language === "id" 
        ? "Bahan materi belajar, latihan, dan persiapan intensif ujian ECL Deutsch B2." 
        : "Ausbildungsvorbereitung, Prüfungsbögen, Vokabelübungen und Lehrmaterialien.",
      href: "/ecl-b2",
      icon: Languages,
      color: "from-cyan-500/20 to-sky-500/20",
      textColor: "text-cyan-500",
      badge: language === "id" ? "Kata Sandi" : "Passwort"
    }
  ];

  return (
    <Reveal id="chapters" className="container-page section-space pt-0 overflow-hidden">
      <SectionHeader
        eyebrow={language === "id" ? "Daftar Isi Perjalanan" : "Inhaltsverzeichnis"}
        title={language === "id" ? "Pilih bab cerita yang ingin Anda baca." : "Wählen Sie ein Kapitel zum Lesen aus."}
        description={language === "id"
          ? "Website ini terbagi menjadi sub-halaman terpisah agar sangat ringan dimuat. Silakan klik salah satu bab di bawah untuk membuka ceritanya."
          : "Diese Website ist in separate Unterseiten unterteilt, um extrem schnell zu laden. Bitte klicken Sie unten auf ein Kapitel, um es zu öffnen."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {chapters.map((chapter, idx) => {
          const Icon = chapter.icon;
          return (
            <motion.div
              key={chapter.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className="premium-card group relative flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-6 transition-colors duration-300 h-full select-none"
            >
              {/* Decorative top-right gradient blob (visible by default on mobile, hover-only on desktop) */}
              <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${chapter.color} blur-2xl transition duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 group-hover:scale-110`} />

              <div>
                <div className="flex items-center justify-between">
                  {/* Icon box - active-styled on mobile by default, hover interactive on desktop, spins and glows on tap */}
                  <div className={`icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface shadow-sm transition duration-300 group-hover:scale-105 group-hover:rotate-6 ${chapter.textColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {chapter.badge && (
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-500 border border-rose-500/15">
                      {chapter.badge}
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-muted group-hover:text-primary/70 transition-colors">
                    {chapter.subtitle}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-black group-hover:translate-x-0.5 transition-transform duration-300">
                    {chapter.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {chapter.description}
                  </p>
                </div>
              </div>

              {/* Buka Bab Ini trigger button */}
              <div className="mt-8">
                <MagneticButton className="w-full">
                  <MotionLink
                    href={chapter.href}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.02, y: -2 },
                      press: { scale: 0.97 }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="button-primary shimmer-constant focus-ring flex items-center justify-center gap-2 px-4 py-3 text-sm font-black w-full shadow-md shadow-primary/15 border-0"
                  >
                    {language === "id" ? "Buka Bab Ini" : "Kapitel öffnen"}
                    <motion.span
                      variants={{
                        hover: { x: 5 },
                        press: { x: 5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="inline-flex items-center"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </MotionLink>
                </MagneticButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Reveal>
  );
}
