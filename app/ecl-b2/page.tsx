import type { Metadata } from "next";
import { ECLMaterialSection } from "@/components/ECLMaterialSection";

export const metadata: Metadata = {
  title: "Materi & Latihan ECL Deutsch B2 — Hajaturrachman",
  description: "Kumpulan materi pembelajaran, kunci jawaban resmi menulis & berbicara, soal latihan membaca & mendengar, dan persiapan intensif ujian sertifikasi ECL Deutsch B2.",
  keywords: ["ECL B2 Jerman", "Materi ECL Deutsch B2 Hajat", "Jawaban Menulis Sprechen ECL", "Latihan Soal Ujian Jerman"],
};

export default function EclB2Page() {
  return (
    <main className="pt-28 sm:pt-[7rem] pb-16">
      <ECLMaterialSection />
    </main>
  );
}
