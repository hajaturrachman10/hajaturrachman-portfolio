"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";

export function AboutSection() {
  const { siteConfig, valueCards } = useSiteData();
  const { language } = useLanguage();

  return (
    <Reveal id="about" className="container-page section-space">
      <SectionHeader
        eyebrow={language === "id" ? "Tentang Saya" : "Über mich"}
        title={language === "id" ? "Perjalanan pribadi yang sedang dibangun dengan arah yang jelas." : "Ein persönlicher Weg, der mit einer klaren Richtung gebaut wird."}
        description={siteConfig.longBio}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="premium-card rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-7 lg:p-8">
          <h3 className="font-display text-2xl font-black">
            {language === "id" ? "Fokus utama sekarang" : "Aktueller Hauptfokus"}
          </h3>
          <p className="mt-3 leading-8 text-muted">
            {language === "id"
              ? "Website ini bukan hanya tampilan, tapi juga ringkasan arah hidup, proses belajar, dan portofolio yang bisa terus dikembangkan."
              : "Diese Website ist nicht nur ein Schaufenster, sondern eine Zusammenfassung meines Lebensweges, Lernprozesses und Portfolios."}
          </p>

          <div className="mt-7 grid gap-3">
            {siteConfig.focus.map((item, index) => (
              <motion.div
                key={item}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-line bg-surface/82 p-3.5 sm:p-4 transition duration-300 hover:border-primary/50 cursor-pointer select-none"
              >
                <span className="icon-orbit grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-sm font-black text-primary animate-pulse">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-bold leading-7 text-muted">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {valueCards.map((card) => (
            <motion.article
              key={card.title}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className="premium-card rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-6 cursor-pointer select-none h-full flex flex-col justify-between"
            >
              <div>
                <motion.div
                  whileTap={{ scale: 0.88, rotate: 6, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.6)" }}
                  className="icon-orbit grid h-12 w-12 place-items-center rounded-2xl border border-line bg-gradient-to-br from-primary/12 to-accent/12 text-primary"
                >
                  <card.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="mt-5 font-display text-xl font-black">
                  {card.title}
                </h3>
                <p className="mt-3 leading-7 text-muted">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Motivasi Personal Section */}
      <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.995 }}
        className="premium-card rounded-3xl sm:rounded-4xl p-4 xs:p-5 sm:p-7 lg:p-8 mt-4 sm:mt-6 border-line bg-gradient-to-br from-primary/5 via-transparent to-accent/5 cursor-pointer select-none"
      >
        <h3 className="font-display text-2xl font-black flex items-center gap-2">
          🩺 {language === "id" ? "Motivasi Personal: Mengapa Keperawatan?" : "Persönliche Motivation: Warum Krankenpflege?"}
        </h3>
        <p className="mt-4 leading-8 text-muted text-sm sm:text-base">
          {language === "id" ? (
            <>
              Bagi saya, keperawatan bukan sekadar profesi, melainkan bentuk nyata dari komunikasi empatik dan pelayanan kemanusiaan. Pengalaman saya memimpin gerakan literasi (Duta Baca) dan mengarahkan film pendek telah mengajarkan saya cara mendengarkan dengan penuh perhatian dan memahami kebutuhan emosional orang lain. Mengintegrasikan keterampilan sosial ini ke dalam lingkungan keperawatan di Jerman melalui program Ausbildung adalah cita-cita jangka panjang saya untuk memberikan perawatan yang profesional, tulus, dan penuh kasih.
            </>
          ) : (
            <>
              Für mich ist die Krankenpflege nicht nur ein Beruf, sondern eine konkrete Form der empathischen Kommunikation und des Dienstes am Menschen. Meine Erfahrungen in der Leitung von Alphabetisierungskampagnen (Lesebotschafter) und der Regie von Kurzfilmen haben mir beigebracht, aufmerksam zuzuhören und die emotionalen Bedürfnisse anderer zu verstehen. Diese sozialen Kompetenzen in das deutsche Pflegeumfeld im Rahmen einer Ausbildung einzubringen, ist mein langfristiges Ziel, um eine professionelle, ehrliche und fürsorgliche Pflege zu leisten.
            </>
          )}
        </p>
      </motion.div>
    </Reveal>
  );
}
