import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";
import { AchievementsSection } from "@/components/AchievementsSection";

export const metadata: Metadata = {
  title: "Karya & Proyek Kreatif — Hajaturrachman",
  description: "Daftar portofolio riset ilmiah, film pendek (Manuskrip, Mawar Merah di Bawah Langit Biru), gerakan literasi, dan rekam jejak kepengurusan organisasi.",
  keywords: ["Film Manuskrip Hajat", "Riset Ilmiah MAN 4 Cirebon", "Wirausaha Ozone Factory Cirebon", "Proyek Kreatif Hajat"],
};

export default function ProjectsPage() {
  return (
    <main className="pt-28 sm:pt-[7rem] pb-16 space-y-6">
      <ProjectsSection />
      <AchievementsSection />
    </main>
  );
}
