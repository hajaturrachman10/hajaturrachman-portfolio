import { HeroSection } from "@/components/sections/HeroSection";
import { PortalHub } from "@/components/sections/PortalHub";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PortalHub />
      <ContactSection />
    </main>
  );
}
