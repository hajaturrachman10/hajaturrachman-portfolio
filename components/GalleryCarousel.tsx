"use client";

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { ImageWithShimmer } from "@/components/ImageWithShimmer";
import { useRef } from "react";

export function GalleryCarousel({ title, images }: { title: string; images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth * 0.82 : -el.clientWidth * 0.82, behavior: "smooth" });
  };

  return (
    <div className="rounded-4xl border border-line bg-surface/82 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Images className="h-5 w-5 text-primary" />
          <h4 className="font-display text-xl font-black">{title}</h4>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll("left")} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-primary/60 hover:text-text" aria-label="Geser kiri"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => scroll("right")} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-primary/60 hover:text-text" aria-label="Geser kanan"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div ref={ref} className="scroll-snap-x flex gap-4 overflow-x-auto pb-3">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="scroll-snap-item relative aspect-[4/3] w-[78%] shrink-0 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft sm:w-[45%] lg:w-[31%]">
            <ImageWithShimmer src={image} alt={`${title} ${index + 1}`} fill sizes="(max-width: 768px) 78vw, 31vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
