import type { Metadata } from "next";
import { GallerySection } from "@/components/GallerySection";

export const metadata: Metadata = {
  title: "Galeri Visual & Kenangan — Hajaturrachman",
  description: "Dokumentasi visual perjalanan belajar bahasa Jerman, mimpi menjelajah dunia, arsip sekolah, tim kreatif produksi film, dan kampanye literasi.",
  keywords: ["Galeri Foto Hajat", "Dokumentasi Belajar Jerman", "Mimpi Keliling Dunia", "Foto OSN MAN 4 Cirebon"],
};

export default function GalleryPage() {
  return (
    <main className="pt-28 sm:pt-[7rem] pb-16">
      <GallerySection />
    </main>
  );
}
