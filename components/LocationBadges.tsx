"use client";

import { motion } from "framer-motion";
import { Home, MapPin } from "lucide-react";
import { useState } from "react";
import { LocationConfirmModal } from "./LocationConfirmModal";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function LocationBadges() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState({ name: "", url: "" });

  const handleOpen = (name: string, url: string) => {
    setTarget({ name, url });
    setModalOpen(true);
  };

  const handleConfirm = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-muted">
        <motion.span
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -1 }}
          onClick={() => handleOpen(language === "id" ? "Jakarta Timur, Indonesia" : "Ost-Jakarta, Indonesien", "https://maps.app.goo.gl/xmndeJxn1jGunPZFA")}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 shadow-sm cursor-pointer select-none transition hover:border-primary/45"
        >
          <MapPin className="h-4 w-4 text-primary animate-pulse" />
          {siteConfig.location}
        </motion.span>
        <motion.span
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -1 }}
          onClick={() => handleOpen(language === "id" ? "Asal Cirebon, Indonesia" : "Herkunft Cirebon, Indonesien", "https://maps.app.goo.gl/QutCa1wj5xDW9QGN7")}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 shadow-sm cursor-pointer select-none transition hover:border-primary/45"
        >
          <Home className="h-4 w-4 text-primary animate-pulse" />
          {language === "id" ? "Asal" : "Aus"} {siteConfig.origin}
        </motion.span>
      </div>

      <LocationConfirmModal
        open={modalOpen}
        targetName={target.name}
        targetUrl={target.url}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
