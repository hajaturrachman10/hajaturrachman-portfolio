"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
  Send,
  Mail,
  ChevronDown,
  ChevronUp,
  Smile,
  Sparkles
} from "lucide-react";
import { ImageWithShimmer } from "@/components/ui/ImageWithShimmer";

// Anniversary Start Date: 16 Mei 2023 00:00:00 WIB (UTC+7)
const ANNIVERSARY_DATE = new Date("2023-05-16T00:00:00+07:00");

// Phone number for WhatsApp Direct Sender (085158518090)
const WA_PHONE_NUMBER = "6285158518090";

const SWEET_QUOTES = [
  "LDR Jakarta Timur ⇄ Cirebon tetap satu hati & saling menjaga! ✨",
  "Always so proud of you, Amel 🌸",
  "Semangat ya kesayangan Ka Hajat, jangan lupa istirahat & makan! 🤍",
  "Doa terbaik selalu menyertai setiap langkah dan impian kita 🤲",
  "Terima kasih sudah selalu jadi sosok yang suportif dan pengertian 💕",
  "Bismillah lancar terus ya sayang untuk masa depan kita bersama 🇩🇪✨",
  "You make every single day brighter & meaningful! ☀️"
];

const PRESET_MESSAGES = [
  { label: "Kaka sayang sama ade gak? ❤️", text: "Kaka sayang sama ade gak? ❤️" },
  { label: "Semangat kerjanya ya Ka Hajat! ✨", text: "Semangat terus ya Ka Hajat kerjanya, jangan lupa istirahat & jaga kesehatan! ✨" },
  { label: "Kangen nih, kapan ketemu lagi? 🥺", text: "Kangen nih Ka Hajat, kapan kita ketemu lagi? 🥺" },
  { label: "Doain persiapan ke Jerman ya sayang 🇩🇪🤲", text: "Bismillah semangat ya Ka Hajat untuk persiapan ujian B2 dan impian ke Jerman, ade selalu doain! 🇩🇪🤲" }
];

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  emoji: string;
}

export function AmelRelationshipCard({
  person,
  content
}: {
  person: {
    name: string;
    role: string;
    image: string;
    story: string;
  };
  content?: string[];
}) {
  const [loveCount, setLoveCount] = useState<number>(128);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);
  const [customWaText, setCustomWaText] = useState("");
  const [showSecretLetter, setShowSecretLetter] = useState(false);

  // Time Together Counter State
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate live days counter
  useEffect(() => {
    function updateCounter() {
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - ANNIVERSARY_DATE.getTime());
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeElapsed({ days, hours, minutes, seconds });
    }

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load and persist love counter in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("amel_love_counter");
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setLoveCount(parsed);
        }
      }
    }
  }, []);

  // Handle Heart Click with Lightweight Particle Burst
  const handleHeartClick = () => {
    const newCount = loveCount + 1;
    setLoveCount(newCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("amel_love_counter", newCount.toString());
    }

    // Cycle through sweet quotes every 3 clicks
    if (newCount % 3 === 0) {
      setActiveQuoteIndex((prev) => (prev + 1) % SWEET_QUOTES.length);
    }

    // Generate 4 lightweight burst particles
    const emojis = ["❤️", "💖", "💕", "🌸", "🤍"];
    const newParticles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: -(Math.random() * 70 + 25),
      scale: Math.random() * 0.3 + 0.8,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));

    setParticles((prev) => [...prev.slice(-8), ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 850);
  };

  // Handle WhatsApp Link Redirection
  const sendWhatsAppMessage = (textToSend: string) => {
    const encoded = encodeURIComponent(textToSend.trim());
    const waUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface/80 p-3.5 sm:p-6 shadow-soft transition-all duration-300 hover:border-primary/40"
    >
      {/* Top Banner: Couple Name & Milestone Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 border-b border-line pb-3.5 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl border border-line bg-primary/10 text-primary shrink-0">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-base sm:text-xl font-black text-text truncate">
              Hajat & Amel
            </h4>
            <p className="text-[10px] sm:text-xs font-bold text-muted flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-primary shrink-0" />
              <span>Anniversary: 16 Mei 2023</span>
            </p>
          </div>
        </div>

        {/* LDR Badge */}
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] sm:text-xs font-bold text-muted">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
          <span>LDR: Jakarta Timur ⇄ Cirebon</span>
        </div>
      </div>

      {/* Main Grid: Left (HD Photo & Love Interaction) | Right (Milestone Counter & WA Sender) */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left Column: HD Real Photo of Amel & Love Button */}
        <div className="lg:col-span-5 flex flex-col items-center w-full">
          
          {/* Photo Frame with Clean Glass Styling */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="group/photo relative w-full aspect-square max-w-[280px] sm:max-w-[320px] overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-md mx-auto"
          >
            <ImageWithShimmer
              src={person.image}
              alt={person.name}
              fill
              sizes="(max-width: 640px) 280px, 320px"
              className="object-cover object-top transition duration-500 ease-out group-hover/photo:scale-105"
            />
            
            {/* Gradient Overlay for subtle depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 pointer-events-none" />

            {/* Bottom Photo Overlay Tag */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-1.5">
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white">
                  {person.role}
                </span>
                <p className="mt-0.5 font-display text-sm sm:text-base font-black text-white drop-shadow-sm truncate">
                  {person.name}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-surface/90 backdrop-blur-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-text border border-line">
                🌸 Favorite Person
              </span>
            </div>
          </motion.div>

          {/* Interactive Love Button & Explosion Container */}
          <div className="relative mt-3.5 sm:mt-4 w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center mx-auto">
            
            {/* Render Floating Particles */}
            <div className="pointer-events-none absolute inset-0 flex justify-center items-center">
              <AnimatePresence>
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                    animate={{
                      opacity: 0,
                      x: p.x,
                      y: p.y,
                      scale: p.scale
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className="absolute text-base sm:text-lg select-none"
                  >
                    {p.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Steady & Clean Clickable Love Button */}
            <motion.button
              type="button"
              onClick={handleHeartClick}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500 to-rose-600 py-2.5 px-3.5 text-white shadow-sm transition-all hover:border-rose-400 hover:shadow-md hover:shadow-rose-500/20 focus:outline-none cursor-pointer select-none flex items-center justify-center gap-2 font-display font-black text-xs sm:text-sm"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white text-white shrink-0" />
              <span>Kirim Love ke Amel ({loveCount})</span>
            </motion.button>

            <p className="mt-1 text-[10px] sm:text-[11px] font-bold text-muted text-center">
              ❤️ Klik untuk mengirimkan cinta & senyuman
            </p>
          </div>
        </div>

        {/* Right Column: Real-time Live Milestone Counter + Story + WhatsApp Sender */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4 w-full">
          
          {/* Live Relationship Counter Box */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl sm:rounded-3xl border border-line bg-surface p-3 sm:p-4 shadow-2xs hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-primary uppercase tracking-wider mb-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Waktu Kebersamaan (16 Mei 2023)</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
              <div className="rounded-xl border border-line bg-surface/90 py-1.5 px-1 sm:p-2.5 transition duration-200 hover:border-primary/30">
                <span className="block font-display text-base sm:text-xl font-black text-text">
                  {timeElapsed.days}
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Hari
                </span>
              </div>
              <div className="rounded-xl border border-line bg-surface/90 py-1.5 px-1 sm:p-2.5 transition duration-200 hover:border-primary/30">
                <span className="block font-display text-base sm:text-xl font-black text-text">
                  {timeElapsed.hours}
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Jam
                </span>
              </div>
              <div className="rounded-xl border border-line bg-surface/90 py-1.5 px-1 sm:p-2.5 transition duration-200 hover:border-primary/30">
                <span className="block font-display text-base sm:text-xl font-black text-text">
                  {timeElapsed.minutes}
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Menit
                </span>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 py-1.5 px-1 sm:p-2.5 transition duration-200 hover:border-primary/40">
                <span className="block font-display text-base sm:text-xl font-black text-primary">
                  {timeElapsed.seconds}
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Detik
                </span>
              </div>
            </div>

            {/* Dynamic Rotating Sweet Quote Banner */}
            <motion.div
              key={activeQuoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-surface/80 border border-line p-2 sm:p-2.5 text-[11px] sm:text-xs font-bold text-muted leading-relaxed"
            >
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-primary mt-0.5" />
              <span className="text-text/90">{SWEET_QUOTES[activeQuoteIndex]}</span>
            </motion.div>
          </motion.div>

          {/* Amel's Profile Story Description */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl sm:rounded-3xl border border-line bg-surface/60 p-3 sm:p-4 hover:border-primary/30 transition-all duration-300"
          >
            <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5" />
              <span>Tentang Amel & Komitmen Kami</span>
            </h5>
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-muted">
              {person.story}
            </p>
          </motion.div>

          {/* Interactive Direct WhatsApp Message Section */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl sm:rounded-3xl border border-line bg-surface p-3 sm:p-4 shadow-2xs hover:border-emerald-500/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Kirim Pesan Cepat ke WhatsApp Ka Hajat</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-muted hidden sm:inline">
                Direct to WA
              </span>
            </div>

            {/* Preset Message Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {PRESET_MESSAGES.map((msg, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => sendWhatsAppMessage(msg.text)}
                  className="text-left rounded-xl border border-line bg-surface/80 p-2 sm:p-2.5 text-[11px] sm:text-xs font-bold text-text hover:border-emerald-500/60 hover:bg-emerald-500/5 transition duration-200 flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <span className="truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {msg.label}
                  </span>
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </motion.button>
              ))}
            </div>

            {/* Custom WhatsApp Text Input */}
            <div className="mt-2 sm:mt-2.5 flex items-center gap-1.5 sm:gap-2">
              <input
                type="text"
                value={customWaText}
                onChange={(e) => setCustomWaText(e.target.value)}
                placeholder="Tulis pesan manis sendiri..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customWaText.trim()) {
                    sendWhatsAppMessage(customWaText);
                  }
                }}
                className="flex-1 rounded-xl border border-line bg-surface px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium placeholder:text-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                disabled={!customWaText.trim()}
                onClick={() => sendWhatsAppMessage(customWaText)}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Kirim WA</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Expandable Secret Love Letter from Hajat */}
          <div className="rounded-2xl sm:rounded-3xl border border-line bg-surface/80 overflow-hidden transition-all duration-300 hover:border-primary/30">
            <button
              type="button"
              onClick={() => setShowSecretLetter(!showSecretLetter)}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left font-display text-xs sm:text-sm font-black text-primary hover:bg-surface transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">Catatan Cinta Spesial dari Hajat untuk Amel 💌</span>
              </div>
              {showSecretLetter ? (
                <ChevronUp className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {showSecretLetter && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="px-3.5 sm:px-5 pb-3.5 sm:pb-4 text-xs sm:text-sm font-bold text-muted leading-relaxed border-t border-line pt-2.5 sm:pt-3"
                >
                  <p className="italic text-text/90">
                    &ldquo;Untuk Amel yang selalu sabar dan pengertian di setiap perjalanan hidup ini. Terima kasih sudah selalu hadir, menemani proses belajar, dan menjadi salah satu alasan terbesar untuk terus berjuang meraih cita-cita ke Jerman. Jarak Jakarta Timur - Cirebon hanyalah angka, yang terpenting hati dan doa kita selalu satu arah. Love you always, Amel! 🤍&rdquo;
                  </p>
                  <p className="mt-2 text-right font-display text-xs font-black text-primary">
                    — Hajaturrachman
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
