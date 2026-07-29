"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithShimmer } from "@/components/ui/ImageWithShimmer";
import { useLanguage } from "@/components/providers/LanguageContext";

export function VaultMemoryCarousel({
  title,
  memories
}: {
  title: string;
  memories: { src: string; caption: string }[];
}) {
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "right" ? el.clientWidth * 0.85 : -el.clientWidth * 0.85,
      behavior: "smooth"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-3xl border border-line bg-surface/40 p-3.5 sm:p-5 mb-6 sm:mb-8"
    >
      <div className="mb-3.5 sm:mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-2.5 w-2.5 rounded-full bg-primary shrink-0"
          />
          <h4 className="font-display text-base sm:text-lg font-black tracking-tight truncate">
            {language === "id" ? "Galeri Kenangan" : "Erinnerungs-Galerie"} {title}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            aria-label="Previous image"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-line bg-surface/70 text-text/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            aria-label="Next image"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-line bg-surface/70 text-text/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2 pt-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {memories.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative flex flex-col justify-between shrink-0 w-[240px] sm:w-[300px] md:w-[320px] rounded-2xl border border-line/60 bg-surface/80 p-2.5 sm:p-3 overflow-hidden shadow-sm transition hover:border-primary/30 hover:shadow-md"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface/60">
              <ImageWithShimmer
                src={m.src}
                alt={m.caption}
                fill
                sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 320px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            </div>
            <p className="mt-2.5 text-xs sm:text-sm font-semibold leading-relaxed text-muted line-clamp-2 px-1">
              {m.caption}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
