"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Mail, Phone, Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/providers/LanguageContext";
import { Tooltip } from "@/components/ui/Tooltip";
import { toast } from "@/components/ui/Toast";

export function Footer() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      setCopiedItem(label);
      toast({
        message:
          label === "email"
            ? language === "id"
              ? "Email Hajaturrachman tersalin!"
              : "E-Mail von Hajaturrachman kopiert!"
            : language === "id"
            ? "Nomor WhatsApp tersalin!"
            : "WhatsApp-Nummer kopiert!",
        type: label === "email" ? "info" : "success",
        duration: 2000,
      });
      copyTimerRef.current = setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  return (
    <footer className="border-t border-line bg-surface/45 px-4 py-10">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-xl font-black select-none">
            {siteConfig.preferredName}
          </span>
          <p className="mt-1.5 text-xs sm:text-sm font-bold text-muted select-none">
            © {year} {siteConfig.name}. {language === "id" ? "Portofolio perjalanan personal." : "Persönliches Reiseportfolio."}
          </p>
          {/* Quick Copy Contact Links */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy("hajaturrachman10@gmail.com", "email")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-line bg-surface/80 hover:bg-canvas text-[11px] font-bold text-muted hover:text-primary transition-all cursor-pointer select-none active:scale-95"
              title={language === "id" ? "Salin Email Hajaturrachman" : "E-Mail von Hajaturrachman kopieren"}
              aria-label={language === "id" ? "Salin Email Hajaturrachman" : "E-Mail von Hajaturrachman kopieren"}
              aria-live="polite"
            >
              {copiedItem === "email" ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="inline-flex items-center gap-1.5 text-primary font-extrabold"
                >
                  <Check className="h-3 w-3 text-primary shrink-0" />
                  <span>{language === "id" ? "Email Tersalin!" : "E-Mail kopiert!"}</span>
                </motion.span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-primary shrink-0" />
                  <span>Email</span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCopy("+6285158518090", "phone")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-line bg-surface/80 hover:bg-canvas text-[11px] font-bold text-muted hover:text-emerald-500 transition-all cursor-pointer select-none active:scale-95"
              title={language === "id" ? "Salin WhatsApp Hajaturrachman" : "WhatsApp-Nummer kopieren"}
              aria-label={language === "id" ? "Salin WhatsApp Hajaturrachman" : "WhatsApp-Nummer kopieren"}
              aria-live="polite"
            >

              {copiedItem === "phone" ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="inline-flex items-center gap-1.5 text-emerald-500 font-extrabold"
                >
                  <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{language === "id" ? "WhatsApp Tersalin!" : "WhatsApp kopiert!"}</span>
                </motion.span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>WhatsApp</span>
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full sm:w-auto">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-y-1 w-full sm:w-auto">
            {siteConfig.navItems
              .filter((item) => item.href !== "/" && item.href !== "/#contact")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-2 py-1.5 text-xs sm:text-sm sm:px-3 sm:py-2 font-black text-muted transition hover:bg-primary/10 hover:text-text"
                >
                  {item.label}
                </Link>
              ))}
          </div>

          <Tooltip content={language === "id" ? "Kembali ke Atas" : "Nach oben"} position="top">
            <motion.button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                  document.body.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              aria-label={language === "id" ? "Kembali ke atas" : "Nach oben"}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="focus-ring group relative flex h-11 w-full sm:h-10 sm:w-10 items-center justify-center gap-2 rounded-full border border-line bg-surface/80 text-xs sm:text-sm font-black text-muted shadow-sm backdrop-blur-md transition-colors duration-300 active:border-primary/60 active:text-primary sm:hover:border-primary/60 sm:hover:text-primary hover:bg-surface cursor-pointer select-none shrink-0"
            >
              <ArrowUp className="h-4 w-4 relative text-muted group-active:text-primary sm:group-hover:text-primary transition-colors shrink-0" />
              <span className="sm:hidden font-black">
                {language === "id" ? "Kembali ke Atas" : "Nach oben"}
              </span>
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </footer>
  );
}
