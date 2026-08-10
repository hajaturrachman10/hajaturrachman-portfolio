import type { Metadata } from "next";
import { GallerySection } from "@/components/sections/GallerySection";

export const metadata: Metadata = {
  title: "Galeri Visual & Kenangan — Hajaturrachman",
  description: "Dokumentasi visual perjalanan belajar bahasa Jerman, mimpi menjelajah dunia, arsip sekolah, tim kreatif produksi film, dan kampanye literasi.",
  keywords: ["Galeri Foto Hajat", "Dokumentasi Belajar Jerman", "Mimpi Keliling Dunia", "Foto OSN MAN 4 Cirebon"],
  alternates: {
    canonical: "/gallery"
  }
};


export default function GalleryPage() {
  return (
    <main id="main-content" tabIndex={-1} className="pt-28 sm:pt-[7.5rem] pb-16 outline-none">

      <GallerySection />
    </main>
  );
}
