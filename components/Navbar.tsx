"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Languages, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSiteData, useLanguageSelector } from "@/data/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

export function Navbar() {
  const { siteConfig } = useSiteData();
  const { language, setLanguage } = useLanguageSelector();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState(pathname === "/" ? "/" : pathname);
 
  useEffect(() => {
    setActiveSection(pathname === "/" ? "/" : pathname);
    setMenuOpen(false);
    setActiveHoverIndex(null);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("menu-open");
    }
  }, [pathname]);
 
  useEffect(() => {
    if (pathname !== "/") return;
    if (menuOpen) return;
 
    // Delay the observer setup slightly to prevent layout measurement lag during menu close transition
    const timeoutId = setTimeout(() => {
      const sections = ["home", "chapters", "contact"];
      const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      };
 
      const observer = new IntersectionObserver((entries) => {
        // If scroll is locked, ignore observer updates
        const isLocked = typeof document !== "undefined" && (document.body.style.position === "fixed" || document.body.classList.contains("modal-open"));
        if (isLocked) return;

        // Check if we are near the bottom of the page
        const isAtBottom = typeof window !== "undefined" && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === "home" || id === "chapters") {
              if (!isAtBottom) {
                setActiveSection("/");
              }
            } else if (id === "contact") {
              setActiveSection("/#contact");
            }
          }
        });
      }, observerOptions);
 
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
 
      // Store observer reference on window to cleanup properly
      (window as any)._navbarObserver = observer;
    }, 350);
 
    return () => {
      clearTimeout(timeoutId);
      const observer = (window as any)._navbarObserver;
      if (observer) {
        const sections = ["home", "chapters", "contact"];
        sections.forEach((id) => {
          const el = document.getElementById(id);
          if (el) observer.unobserve(el);
        });
        delete (window as any)._navbarObserver;
      }
    };
  }, [pathname, menuOpen]);
 
  useEffect(() => {
    function handleScroll() {
      // If scroll is locked (e.g. mobile menu or modals open), ignore scroll events
      const isLocked = typeof document !== "undefined" && (document.body.style.position === "fixed" || document.body.classList.contains("modal-open"));
      if (isLocked) return;

      setScrolled(window.scrollY > 18);
      if (pathname === "/") {
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
        if (isAtBottom) {
          setActiveSection("/#contact");
        } else if (window.scrollY < 50) {
          setActiveSection("/");
        }
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleHash() {
      setHash(window.location.hash);
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    // Listen to pushState changes (popstate triggers when back/forward is pressed)
    window.addEventListener("popstate", handleHash);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("popstate", handleHash);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  useEffect(() => {
    let menuOpenClassTimeoutId: NodeJS.Timeout;
    if (menuOpen) {
      lockScroll();
      document.body.classList.add("menu-open");
      if (typeof document !== "undefined") {
        (document.activeElement as HTMLElement)?.blur();
      }
    } else {
      unlockScroll();
      menuOpenClassTimeoutId = setTimeout(() => {
        document.body.classList.remove("menu-open");
      }, 550);
    }
    return () => {
      if (menuOpenClassTimeoutId) clearTimeout(menuOpenClassTimeoutId);
    };
  }, [menuOpen]);

  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    const linkEl = element.closest("[data-nav-index]");
    if (linkEl) {
      const idx = parseInt(linkEl.getAttribute("data-nav-index") || "", 10);
      if (!isNaN(idx)) {
        setActiveHoverIndex(idx);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setActiveHoverIndex(null);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={cn(
          "container-page flex items-center justify-between rounded-full border px-3.5 py-2 sm:px-5 sm:py-2.5 transition-all duration-300 relative z-50",
          scrolled
            ? "border-line/90 bg-surface/88 shadow-card backdrop-blur-2xl"
            : "border-line/40 bg-surface/55 shadow-sm backdrop-blur-xl"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
        >
          <Link
            href="/"
            onClick={(e) => {
              if (typeof document !== "undefined") {
                (document.activeElement as HTMLElement)?.blur();
                document.body.style.overflow = "";
                document.documentElement.style.overflow = "";
              }
              setActiveSection("/");
              setMenuOpen(false);
              if (typeof window !== "undefined") {
                sessionStorage.setItem("portfolio_scroll_/", "0");
                sessionStorage.setItem("portfolio_scroll_at_bottom_/", "false");
                sessionStorage.setItem("portfolio_scroll_target_top", "true");
              }
              if (pathname === "/") {
                e.preventDefault();
                if (typeof window !== "undefined" && window.scrollY > 8) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
                if (
                  typeof window !== "undefined" &&
                  window.history &&
                  typeof window.history.pushState === "function"
                ) {
                  window.history.pushState(null, "", window.location.pathname);
                }
              }
            }}
            className="focus-ring flex items-center gap-3 rounded-full group"
          >
            <motion.span
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent text-sm font-black text-white shadow-glow group-hover:shadow-primary/20"
            >
              H
            </motion.span>
            
            <span className="hidden leading-tight sm:block transition-transform duration-300 group-hover:translate-x-0.5">
              <span className="block font-display text-sm font-black tracking-tight">
                {siteConfig.preferredName}
              </span>
              <span className="block text-xs font-bold text-muted">
                {language === "id" ? "Portofolio" : "Portfolio"}
              </span>
            </span>
          </Link>
        </motion.div>

        <motion.div 
          className="hidden items-center gap-1 lg:flex"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.05 }}
        >
          {siteConfig.navItems.map((item, index) => {
            const isActive = item.href === activeSection;
            const isHovered = activeHoverIndex === index;
            return (
              <div key={item.href} className="flex items-center">
                {index === 1 && (
                  <span className="mx-2 h-4 w-px bg-line/80" />
                )}
                <Link
                  href={item.href}
                  onMouseEnter={() => setActiveHoverIndex(index)}
                  onMouseLeave={() => setActiveHoverIndex(null)}
                  onClick={(e) => {
                    const isCurrentPage = item.href === pathname || (item.href === "/" && pathname === "/");
                    const isContactScrollOnHome = item.href.startsWith("/#") && pathname === "/";
                    document.body.style.overflow = "";
                    document.documentElement.style.overflow = "";
                    
                    if (typeof window !== "undefined") {
                      if (item.href === "/" || !item.href.startsWith("/#")) {
                        sessionStorage.setItem("portfolio_scroll_target_top", "true");
                      } else if (item.href.startsWith("/#")) {
                        const hash = item.href.substring(2);
                        sessionStorage.setItem("portfolio_scroll_target_hash", hash);
                      }
                    }

                    if (isCurrentPage) {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    } else if (isContactScrollOnHome) {
                      e.preventDefault();
                      const id = item.href.substring(2);
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }
                    setActiveSection(item.href);
                  }}
                  className={cn(
                     "focus-ring relative rounded-full px-4 py-2 text-sm font-black",
                     isActive
                       ? "bg-primary/10 text-primary font-black"
                       : cn("transition-all duration-300", isHovered ? "text-text" : "text-muted")
                   )}
                >
                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="hover-nav-bg-desktop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  {item.label}
                </Link>
              </div>
            );
          })}
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Language Switcher Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.1 }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setLanguage(language === "id" ? "de" : "id")}
              className="focus-ring flex h-10 px-3 items-center justify-center gap-1.5 rounded-full border border-line bg-surface/90 text-xs font-black hover:border-primary/60 cursor-pointer select-none transition group"
              aria-label="Switch Language"
            >
              <motion.span
                animate={{ rotate: language === "id" ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 13 }}
                className="inline-block"
              >
                <Languages className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors" />
              </motion.span>
              <span>{language === "id" ? "ID" : "DE"}</span>
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.12 }}
          >
            <ThemeToggle />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.14 }}
          >
            <motion.button
              type="button"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMenuOpen((value) => !value)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "focus-ring grid h-11 w-11 place-items-center rounded-full border shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 lg:hidden cursor-pointer select-none",
                menuOpen
                  ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-500"
                  : "border-line bg-surface/90 text-text hover:border-primary/60"
              )}
            >
              <motion.div
                key={menuOpen ? "close" : "open"}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 15 }}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <>
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/65 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="container-page mt-3 overflow-hidden rounded-4xl border border-line bg-surface/90 backdrop-blur-md p-3 shadow-card lg:hidden relative z-50"
            >
              <div 
                className="grid gap-1"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  const linkEl = element?.closest("[data-nav-index]");
                  if (linkEl) {
                    const idx = parseInt(linkEl.getAttribute("data-nav-index") || "", 10);
                    if (!isNaN(idx)) {
                      setActiveHoverIndex(idx);
                    }
                  }
                }}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {siteConfig.navItems.map((item, index) => {
                  const isActive = item.href === activeSection;
                  const isHovered = activeHoverIndex === index;
                  return (
                    <div key={item.href} className="flex flex-col relative">
                      {index === 1 && (
                        <hr className="my-1.5 border-line/65" />
                      )}
                      <Link
                        href={item.href}
                        data-nav-index={index}
                        onMouseEnter={() => setActiveHoverIndex(index)}
                        onMouseLeave={() => setActiveHoverIndex(null)}
                         onClick={(e) => {
                          const isCurrentPage = item.href === pathname || (item.href === "/" && pathname === "/");
                          const isContactScrollOnHome = item.href.startsWith("/#") && pathname === "/";
                          document.body.style.overflow = "";
                          document.documentElement.style.overflow = "";

                          if (typeof window !== "undefined") {
                            if (item.href === "/" || !item.href.startsWith("/#")) {
                              sessionStorage.setItem("portfolio_scroll_target_top", "true");
                            } else if (item.href.startsWith("/#")) {
                              const hash = item.href.substring(2);
                              sessionStorage.setItem("portfolio_scroll_target_hash", hash);
                            }
                          }

                          if (isCurrentPage) {
                            e.preventDefault();
                            if (typeof window !== "undefined") {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          } else if (isContactScrollOnHome) {
                            e.preventDefault();
                            const id = item.href.substring(2);
                            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                          }
                          setActiveSection(item.href);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "rounded-3xl px-4 py-3 text-sm font-black w-full relative z-10",
                          isActive
                            ? "bg-primary/10 text-primary font-black"
                            : "text-muted"
                        )}
                      >

                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
