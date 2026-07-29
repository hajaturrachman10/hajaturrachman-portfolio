import type { Metadata } from "next";
import { JourneySection } from "@/components/sections/JourneySection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { TimelineSection } from "@/components/sections/TimelineSection";

export const metadata: Metadata = {
  title: "Cerita & Arah Hidup — Hajaturrachman",
  description: "Peta perjalanan hidup, riwayat pendidikan, pengalaman organisasi, kepemimpinan Duta Baca, motivasi karir, dan persiapan Ausbildung perawat di Jerman.",
  keywords: ["Perjalanan Hajat", "Riwayat Pendidikan Hajat", "Duta Baca Kabupaten Cirebon", "Germany Indonesia Professionals", "Ausbildung Jerman"],
};

export default function JourneyPage() {
  return (
    <main className="pt-28 sm:pt-[7rem] pb-16 space-y-4">
      <JourneySection />
      <AboutSection />
      <SkillsSection />
      <TimelineSection />
    </main>
  );
}
