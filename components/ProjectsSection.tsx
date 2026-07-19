"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, FileText, Layers3, X } from "lucide-react";
import { ImageWithShimmer } from "@/components/ImageWithShimmer";
import { useEffect, useMemo, useState } from "react";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { cn } from "@/lib/utils";
import { useSiteData, type PortofolioProject, type ProjectCategory } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const filters: Array<"Semua" | ProjectCategory> = ["Semua", "Film", "Riset", "Literasi", "Organisasi"];

export function ProjectsSection() {
  const { projects } = useSiteData();
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Semua");
  const [selectedProject, setSelectedProject] = useState<PortofolioProject | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when project modal is opened
  useEffect(() => {
    if (!selectedProject) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [selectedProject]);

  const visibleProjects = useMemo(() => {
    if (activeFilter === "Semua") return projects;
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <>
      <Reveal id="projects" className="container-page section-space pt-0 overflow-hidden">
        <SectionHeader
          eyebrow={language === "id" ? "Portofolio" : "Portfolio"}
          title={language === "id" ? "Karya dan proyek yang bisa dibuka seperti cerita." : "Werke und Projekte, die wie Geschichten erzählt werden."}
          description={language === "id"
            ? "Setiap proyek punya detail proses, galeri geser, link video atau dokumen, pembelajaran, dan ruang dokumentasi."
            : "Jedes Projekt enthält detaillierte Prozesse, eine Bildergalerie, offizielle Links und gewonnene Erkenntnisse."}
        />
        <div className="mb-8 flex sm:inline-flex flex-nowrap sm:flex-wrap items-center gap-1.5 sm:gap-2 rounded-full border border-line bg-surface/50 dark:bg-elevated/30 p-1.5 relative z-10 backdrop-blur-md max-w-full overflow-x-auto scrollbar-none">
          {(() => {
            const filterLabels = {
              Semua: language === "id" ? "Semua" : "Alle",
              Film: language === "id" ? "Film" : "Film",
              Riset: language === "id" ? "Riset" : "Forschung",
              Literasi: language === "id" ? "Literasi" : "Alphabetisierung",
              Organisasi: language === "id" ? "Organisasi" : "Organisation"
            };
            return filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <MagneticButton key={filter}>
                  <motion.button
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    whileHover="hover"
                    whileTap="press"
                    variants={{
                      hover: { scale: 1.04, y: -1 },
                      press: { scale: 0.96 }
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className={cn(
                      "focus-ring relative rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm font-black transition-colors duration-300 select-none cursor-pointer border-0 shrink-0",
                      isActive ? "text-white border border-transparent bg-transparent" : "border border-slate-400 dark:border-white/30 bg-transparent text-slate-700 dark:text-white/80 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-project-filter"
                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-glow shadow-primary/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {filterLabels[filter]}
                  </motion.button>
                </MagneticButton>
              );
            });
          })()}
        </div>
        <motion.div
          key={activeFilter}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleProjects.map((project) => (
            <motion.div
              key={project.title}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="h-full"
            >
              <ProjectCard project={project} onOpen={() => setSelectedProject(project)} />
            </motion.div>
          ))}
        </motion.div>
      </Reveal>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}

function ProjectCard({ project, onOpen }: { project: PortofolioProject; onOpen: () => void }) {
  const { language } = useLanguage();
  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
      className="premium-card group overflow-hidden rounded-4xl select-none cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-primary/10">
        <ImageWithShimmer src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/88 px-3 py-1 text-xs font-black text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 dark:text-white">
          {project.category === "Film"
            ? (language === "id" ? "Film" : "Film")
            : project.category === "Riset"
            ? (language === "id" ? "Riset" : "Forschung")
            : project.category === "Literasi"
            ? (language === "id" ? "Literasi" : "Alphabetisierung")
            : (language === "id" ? "Organisasi" : "Organisation")}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-black leading-tight">{project.title}</h3>
          <MagneticButton className="shrink-0">
            <motion.div
              whileHover="hover"
              whileTap="press"
              variants={{
                hover: { scale: 1.08, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
                press: { scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }
              }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="icon-orbit grid h-10 w-10 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
            >
              <Layers3 className="h-5 w-5" />
            </motion.div>
          </MagneticButton>
        </div>
        <p className="leading-7 text-muted">{project.description}</p>
        <p className="mt-4 rounded-3xl border border-line bg-surface/82 p-4 text-sm font-bold leading-6 text-muted">{project.impact}</p>
        <div className="mt-5 flex flex-wrap gap-2">{project.tech.map((tech) => <span key={tech} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{tech}</span>)}</div>
        <div className="mt-auto pt-6 flex flex-wrap gap-3">
          <MagneticButton>
            <motion.button
              type="button"
              onClick={onOpen}
              whileHover="hover"
              whileTap="press"
              variants={{
                hover: { scale: 1.02, y: -2 },
                press: { scale: 0.97 }
              }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="button-primary shimmer-constant focus-ring px-4 py-2 text-sm border-0"
            >
              {language === "id" ? "Buka Cerita" : "Details anzeigen"}
              <motion.span
                variants={{
                  hover: { x: 3, y: -3 },
                  press: { x: 3, y: -3 }
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="inline-flex items-center"
              >
                <ArrowUpRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          </MagneticButton>
          {project.demoLinks?.[0] ? (
            <MagneticButton>
              <motion.a
                href={project.demoLinks[0].href}
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.02, y: -2 },
                  press: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="button-secondary focus-ring px-4 py-2 text-sm border-0"
              >
                {project.demoLinks[0].label}
                <motion.span
                  variants={{
                    hover: { x: 3, y: -3 },
                    press: { x: 3, y: -3 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="inline-flex items-center ml-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.span>
              </motion.a>
            </MagneticButton>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function ProjectModal({ project, onClose }: { project: PortofolioProject | null; onClose: () => void }) {
  const { language } = useLanguage();
  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[80] overflow-y-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card mx-auto w-full max-w-6xl overflow-hidden rounded-3xl sm:rounded-4xl"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/7] w-full overflow-hidden bg-primary/10">
              <ImageWithShimmer src={project.image} alt={project.title} fill sizes="100vw" className="object-cover" />
            </div>
            <div className="p-4 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] sm:text-sm font-black uppercase tracking-[0.18em] text-primary">
                    {project.category === "Film"
                      ? (language === "id" ? "Film" : "Film")
                      : project.category === "Riset"
                      ? (language === "id" ? "Riset" : "Forschung")
                      : project.category === "Literasi"
                      ? (language === "id" ? "Literasi" : "Alphabetisierung")
                      : (language === "id" ? "Organisasi" : "Organisation")}{" "}
                    - {project.detail.year}
                  </p>
                  <h3 className="mt-2 font-display text-2xl sm:text-4xl font-black">{project.title}</h3>
                  <p className="mt-2 text-xs sm:text-base leading-6 sm:leading-8 text-muted">{project.detail.overview}</p>
                </div>
                <div className="rounded-2xl sm:rounded-3xl border border-line bg-surface/82 p-3 sm:p-4 shrink-0 min-w-[140px]">
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-muted">{language === "id" ? "Peran" : "Rolle"}</p>
                  <p className="mt-0.5 font-display text-base sm:text-lg font-black">{project.detail.role}</p>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-4xl border border-line bg-surface/82 p-4 sm:p-5">
                <h4 className="font-display text-lg sm:text-xl font-black">{language === "id" ? "Cerita Proyek" : "Projektbeschreibung"}</h4>
                <p className="mt-3 text-xs sm:text-base leading-6 sm:leading-8 text-muted">{project.detail.story}</p>
              </div>
              <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 lg:grid-cols-3">
                <DetailList title={language === "id" ? "Proses" : "Prozess"} items={project.detail.process} />
                <DetailList title={language === "id" ? "Pembelajaran" : "Erkenntnisse"} items={project.detail.learnings} />
                <div className="rounded-2xl sm:rounded-4xl border border-line bg-surface/82 p-4 sm:p-5">
                  <h4 className="font-display text-lg sm:text-xl font-black">{language === "id" ? "Rencana Berikutnya" : "Nächste Schritte"}</h4>
                  <p className="mt-3 text-xs sm:text-base leading-6 sm:leading-8 text-muted">{project.detail.nextStep}</p>
                </div>
              </div>
              <div className="mt-6 sm:mt-8">
                <GalleryCarousel title={language === "id" ? "Galeri Proyek" : "Projektgalerie"} images={project.gallery} />
              </div>
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-6">
                {(project.demoLinks?.length || project.documents?.length) ? (
                  <div className="w-full">
                    {project.demoLinks?.length ? (
                      <div className="rounded-4xl border border-line bg-surface/82 p-5">
                        <h4 className="font-display text-xl font-black">{language === "id" ? "Video & Tautan" : "Videos & Links"}</h4>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {project.demoLinks.map((link) => (
                            <MagneticButton key={link.href}>
                              <motion.a
                                href={link.href}
                                whileHover="hover"
                                whileTap="press"
                                variants={{
                                  hover: { scale: 1.02, y: -2 },
                                  press: { scale: 0.97 }
                                }}
                                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                                className="button-secondary focus-ring text-sm border-0"
                              >
                                {link.label}
                                <motion.span
                                  variants={{
                                    hover: { x: 3, y: -3 },
                                    press: { x: 3, y: -3 }
                                  }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  className="inline-flex items-center ml-1.5"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </motion.span>
                              </motion.a>
                            </MagneticButton>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {project.documents?.length ? (
                      <div className="rounded-4xl border border-line bg-surface/82 p-5">
                        <h4 className="font-display text-xl font-black">{language === "id" ? "Dokumen" : "Unterlagen"}</h4>
                        <div className="mt-4 grid gap-3">
                          {project.documents.map((doc) => (
                            <motion.a key={doc.href} href={doc.href} whileTap={{ scale: 0.96 }} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 font-black text-muted transition hover:border-primary/60 hover:text-text cursor-pointer select-none">
                              <FileText className="h-5 w-5 text-primary" />
                              {doc.title}
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : <div />}
                
                {/* Tutup Detail button aligned next to it */}
                <div className="flex justify-end w-full lg:w-auto">
                  <MagneticButton className="w-full lg:w-auto">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.02, y: -2 },
                        press: { scale: 0.97 }
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 18 }}
                      className="rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white px-6 py-3.5 text-sm font-black transition-colors duration-300 w-full flex items-center justify-center gap-1.5 cursor-pointer select-none shadow-md shadow-rose-600/10 border-0"
                    >
                      <motion.span
                        variants={{
                          hover: { rotate: 90, scale: 1.1 },
                          press: { rotate: 90, scale: 0.9 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="inline-flex items-center mr-1"
                      >
                        <X className="h-4 w-4" />
                      </motion.span>
                      <span>{language === "id" ? "Tutup Detail" : "Schließen"}</span>
                    </motion.button>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl sm:rounded-4xl border border-line bg-surface/82 p-4 sm:p-5">
      <h4 className="font-display text-lg sm:text-xl font-black">{title}</h4>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <p key={item} className="flex gap-3 text-xs sm:text-sm font-bold leading-6 sm:leading-7 text-muted">
            <span className="mt-0.5 grid h-5 w-5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-black text-primary">
              {index + 1}
            </span>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
