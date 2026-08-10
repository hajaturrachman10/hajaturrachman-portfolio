import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { PortalHub } from "@/components/sections/PortalHub";
import { ContactSection } from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Hajaturrachman — Personal Portofolio Resmi | Hajat ECL B2",
  description:
    "Website portofolio pribadi Hajaturrachman: perjalanan bahasa Jerman ECL B2, Ausbildung perawat di Jerman, proyek kreatif, galeri karya, dan informasi kontak resmi.",
  openGraph: {
    title: "Hajaturrachman — Personal Portofolio Resmi",
    description:
      "Portofolio personal Hajaturrachman: perjalanan bahasa Jerman ECL B2, pengalaman organisasi, proyek kreatif, target Ausbildung perawat di Jerman, dan mimpi berkeliling dunia.",
  },
};

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">

      <HeroSection />
      <PortalHub />
      <ContactSection />
    </main>
  );
}
