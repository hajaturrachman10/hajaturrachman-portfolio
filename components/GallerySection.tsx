"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, PlayCircle, X, ArrowRight } from "lucide-react";
import { ImageWithShimmer } from "@/components/ImageWithShimmer";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData, type GalleryItem } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

export function GallerySection() {
  const { publicGallery } = useSiteData();
  const { language } = useLanguage();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when gallery item details are opened
  useEffect(() => {
    if (!selected) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [selected]);

  return (
    <>
      <Reveal id="gallery" className="container-page section-space pt-0 overflow-hidden">
        <SectionHeader
          eyebrow={language === "id" ? "Galeri" : "Galerie"}
          title={language === "id" ? "Ruang visual untuk cerita yang terus bertambah." : "Visueller Raum für wachsende Lebensabschnitte."}
          description={language === "id"
            ? "Enam galeri utama disiapkan sebagai arsip foto dan video perjalanan, karya, literasi, sekolah, dan mimpi masa depan."
            : "Sechs Hauptgalerien stehen als Foto- und Videoarchiv für Deutschvorbereitung, Projekte, Schule und Zukunftsträume bereit."}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicGallery.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="premium-card group overflow-hidden rounded-4xl text-left select-none flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ImageWithShimmer src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="rounded-full bg-white/88 px-3 py-1 text-xs font-black text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 dark:text-white">
                    {item.category === "Journey"
                      ? (language === "id" ? "Persiapan Jerman" : "Deutschland-Reise")
                      : item.category === "Dream"
                      ? (language === "id" ? "Mimpi Keliling Dunia" : "Weltreise-Traum")
                      : item.category === "School"
                      ? (language === "id" ? "Memori Sekolah" : "Schulzeit")
                      : item.category === "Creative"
                      ? (language === "id" ? "Proyek Kreatif" : "Kreativprojekte")
                      : item.category === "School" ? (language === "id" ? "Memori Sekolah" : "Schulzeit")
                      : item.category === "Literacy"
                      ? (language === "id" ? "Literasi & Buku" : "Alphabetisierung")
                      : (language === "id" ? "Koleksi Pribadi" : "Lebensarchiv")}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-4">
                  <motion.div
                    whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                    className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
                  >
                    <Camera className="h-6 w-6" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-muted">{item.caption}</p>
                    <div className="mt-4">
                      <MagneticButton>
                        <motion.button
                          type="button"
                          onClick={() => setSelected(item)}
                          whileHover="hover"
                          whileTap="press"
                          variants={{
                            hover: { scale: 1.02, y: -2 },
                            press: { scale: 0.97 }
                          }}
                          transition={{ type: "spring", stiffness: 450, damping: 18 }}
                          className="button-primary focus-ring px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer select-none border-0"
                        >
                          <span>{language === "id" ? "Buka Galeri" : "Galerie öffnen"}</span>
                          <motion.span
                            variants={{
                              hover: { x: 3 },
                              press: { x: 1 }
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 12 }}
                            className="inline-flex items-center"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </motion.span>
                        </motion.button>
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>
      <GalleryModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function GalleryModal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { language } = useLanguage();
  
  // Reset active thumbnail index when item changes
  useEffect(() => {
    setActiveIndex(0);
  }, [item]);

  const active = item ? (item.media[activeIndex] ?? item.media[0]) : null;
  
  const move = (direction: "prev" | "next") => {
    if (!item) return;
    setActiveIndex((current) => 
      direction === "next" 
        ? (current + 1) % item.media.length 
        : (current - 1 + item.media.length) % item.media.length
    );
  };

  return (
    <AnimatePresence>
      {item && active ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[80] overflow-y-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card mx-auto w-full max-w-6xl overflow-hidden rounded-4xl"
          >
          <div className="flex items-center justify-between gap-4 border-b border-line p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{item.category}</p>
              <h3 className="font-display text-2xl font-black">{item.title}</h3>
            </div>
            <MagneticButton className="shrink-0">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.02, y: -2 },
                  press: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white px-4 py-2 text-xs font-black transition-colors duration-300 flex items-center gap-1.5 cursor-pointer select-none shadow-md shadow-rose-600/10 border-0"
              >
                <motion.span
                  variants={{
                    hover: { rotate: 90, scale: 1.1 },
                    press: { rotate: 90, scale: 0.9 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="inline-flex items-center"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.span>
                <span>{language === "id" ? "Tutup" : "Schließen"}</span>
              </motion.button>
            </MagneticButton>
          </div>
          <div className="grid gap-5 p-4 lg:grid-cols-[1fr_18rem]">
            <div className="relative aspect-video overflow-hidden rounded-4xl border border-line bg-surface">
              {active.type === "image" ? (
                 <ImageWithShimmer src={active.src} alt={active.title} fill sizes="100vw" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="text-center">
                    <PlayCircle className="mx-auto h-16 w-16 text-primary" />
                    <p className="mt-4 font-display text-2xl font-black">{active.title}</p>
                  </div>
                </div>
              )}
              <MagneticButton className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                <motion.button
                  type="button"
                  onClick={() => move("prev")}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.1, x: -2 },
                    press: { scale: 0.9, x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-white/86 text-slate-900 shadow-card backdrop-blur-xl cursor-pointer border-0"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              </MagneticButton>
              <MagneticButton className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                <motion.button
                  type="button"
                  onClick={() => move("next")}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.1, x: 2 },
                    press: { scale: 0.9, x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-white/86 text-slate-900 shadow-card backdrop-blur-xl cursor-pointer border-0"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </MagneticButton>
            </div>
            <div className="flex flex-row overflow-x-auto lg:grid lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1 gap-2.5 sm:gap-3 scrollbar-none pb-2 lg:pb-0 max-w-full">
              {item.media.map((media, index) => (
                <motion.button
                  key={`${media.src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 rounded-3xl border p-2 text-left transition cursor-pointer select-none shrink-0 w-[180px] lg:w-auto ${
                    index === activeIndex 
                      ? "border-primary bg-primary/10" 
                      : "border-line bg-surface/80 hover:border-primary/60"
                  }`}
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                    {media.type === "image" ? (
                       <ImageWithShimmer src={media.src} alt={media.title} fill sizes="5rem" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-primary">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-black text-muted truncate">{media.title}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
