"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function Footer() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface/45 px-4 py-10">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-xl font-black select-none">
            {siteConfig.preferredName}
          </span>
          <p className="mt-2 text-sm font-bold text-muted select-none">
            © {year} {siteConfig.name}. {language === "id" ? "Portofolio perjalanan personal." : "Persönliches Reiseportfolio."}
          </p>
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

          <motion.button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                document.body.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            aria-label="Kembali ke atas"
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-full sm:w-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white cursor-pointer select-none shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all duration-300 shrink-0 border-0 focus-ring"
          >
            <motion.div
              variants={{
                initial: { y: 0 },
                hover: {
                  y: [0, -4, 0],
                  transition: {
                    repeat: Infinity,
                    duration: 0.5,
                    ease: "easeInOut"
                  }
                }
              }}
            >
              <ArrowUp className="h-5 w-5" />
            </motion.div>
            <span className="text-sm font-black sm:hidden">
              {language === "id" ? "Kembali ke Atas" : "Nach oben"}
            </span>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
