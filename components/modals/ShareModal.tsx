"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, ArrowLeft, Send, Instagram, Download, MessageSquare, X, RefreshCw } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { toast } from "@/components/ui/Toast";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
};

export function ShareModal({ open, onClose, title = "Portofolio Hajaturrachman", url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [igToast, setIgToast] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://hajaturrachman.com");

  // Real scannable QR Code URL (High Vector Quality 400x400)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`;

  // Pre-filled WhatsApp chat message template
  const waMessage = `Halo Hajat, saya baru saja melihat portofolio Anda di ${shareUrl} dan tertarik untuk berdiskusi lebih lanjut!`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

  // Lock body scroll, reset QR state, and trap keyboard focus when share modal is open
  useEffect(() => {
    if (!open) return;
    setQrLoaded(false);
    lockScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!modal) return;
        const focusables = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);


  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ message: "Tautan portofolio berhasil disalin ke clipboard!", type: "purple", title: "Tautan Tersalin" });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstagramShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIgToast(true);
      setTimeout(() => {
        setIgToast(false);
        window.open("https://instagram.com/saya.hajat", "_blank", "noopener,noreferrer");
      }, 1000);
    } else {
      window.open("https://instagram.com/saya.hajat", "_blank", "noopener,noreferrer");
    }
  };

  // Unduh Kartu QR Portofolio Bergambar & Berpenjelasan
  const handleDownloadQR = async () => {
    try {
      setDownloading(true);
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill Dark Premium Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1000);
      grad.addColorStop(0, "#0b1329");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1000);

      // Draw Top Accent Border
      const topGrad = ctx.createLinearGradient(0, 0, 800, 0);
      topGrad.addColorStop(0, "#38bdf8");
      topGrad.addColorStop(0.5, "#6366f1");
      topGrad.addColorStop(1, "#ec4899");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 800, 16);

      // Outer Card Frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 720, 920);

      // Header Text: Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Hajaturrachman", 400, 120);

      // Sub-header Text: Role
      ctx.fillStyle = "#38bdf8";
      ctx.font = "700 22px sans-serif";
      ctx.fillText("Kandidat Ausbildung Keperawatan di Jerman", 400, 165);

      // Sub-header Text 2: Tagline
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 18px sans-serif";
      ctx.fillText("Portofolio Profesional, Dokumen ECL B2 & Proyek Kreatif", 400, 200);

      // Draw White Card Background for QR Code
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(175, 240, 450, 480, 28);
      ctx.fill();

      // Load & Draw QR Code Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrImageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      ctx.drawImage(img, 210, 275, 380, 380);

      // Caption inside White Card
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Pindai Kode QR Ini Menggunakan Kamera HP", 400, 685);

      // Explanation Box below QR Card
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(80, 750, 640, 110, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "600 17px sans-serif";
      ctx.fillText("Jelajahi riwayat pendidikan, sertifikat ECL Deutsch B2,", 400, 790);
      ctx.fillText("dokumen prestasi, serta film pendek karya Hajaturrachman.", 400, 820);

      // Footer URL
      ctx.fillStyle = "#38bdf8";
      ctx.font = "900 22px sans-serif";
      ctx.fillText(shareUrl, 400, 915);

      // Convert Canvas to PNG and Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "Hajaturrachman-Portfolio-QRCard.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Gagal mengunduh QR Card:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[120] grid place-items-center px-4 py-8 overflow-y-auto transform-gpu will-change-[opacity]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.93 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 26
            }}
            onClick={(e) => e.stopPropagation()}
            className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-line bg-surface shadow-2xl relative flex flex-col gap-5 sm:gap-6 my-auto shrink-0 transform-gpu will-change-[transform,opacity]"
          >
            {/* Header dengan Icon Orbit Seragam 1:1 (Identik Password/Location Modal) */}
            <div className="flex flex-col items-center text-center gap-3 shrink-0">
              <motion.div
                whileHover={{ scale: 1.06, rotate: 6 }}
                whileTap={{ scale: 0.94, rotate: 3 }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none"
              >
                <Share2 className="h-7 w-7" />
              </motion.div>

              <div className="w-full">
                <h3 className="font-display text-xl sm:text-2xl font-black text-primary">Bagikan Portofolio</h3>
                <p className="mt-1 text-xs sm:text-sm font-bold leading-relaxed text-muted">
                  Pindai Kode QR di bawah atau bagikan langsung via WhatsApp & Instagram.
                </p>
              </div>
            </div>

            {/* Display QR Code Asli yang Jelas, Dapat Di-scan & Di-unduh */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-line bg-surface/60 flex flex-col items-center gap-4 text-center relative overflow-hidden shrink-0">
              <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center border border-slate-200 relative overflow-hidden shrink-0">
                {!qrLoaded && (
                  <div className="absolute inset-0 skeleton-shimmer z-10 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                    <div className="h-12 w-12 rounded-xl border border-line/40 bg-surface/40 skeleton-shimmer" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">Menyiapkan QR...</span>
                  </div>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={qrImageUrl}
                  alt="Kode QR Portofolio Hajaturrachman"
                  onLoad={() => setQrLoaded(true)}
                  initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
                  animate={qrLoaded ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.82, rotate: -4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-1.5 w-full shrink-0">
                <span className="text-xs font-bold text-muted block">
                  Pindai Kode QR ini dengan kamera HP untuk membuka Portofolio
                </span>
                
                {/* Tombol Unduh QR Card */}
                <MagneticButton className="w-full max-w-xs mx-auto">
                  <motion.button
                    type="button"
                    onClick={handleDownloadQR}
                    disabled={downloading || !qrLoaded}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    <span>{downloading ? "Menyiapkan Gambar..." : "Unduh Kartu QR Portofolio"}</span>
                  </motion.button>
                </MagneticButton>
              </div>
            </div>

            {/* Input Link Portofolio + Tombol Salin */}
            <div className="space-y-2 shrink-0">
              <label className="block text-xs font-black uppercase tracking-wider text-muted">Tautan Portofolio</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="input-field px-4 py-3 text-xs sm:text-sm font-medium w-full rounded-2xl select-all border border-line bg-surface/80"
                />
                <MagneticButton className="shrink-0">
                  <motion.button
                    type="button"
                    onClick={handleCopy}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs sm:text-sm font-black transition-all cursor-pointer select-none"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Tersalin!" : "Salin"}</span>
                  </motion.button>
                </MagneticButton>
              </div>
            </div>

            {/* Action Buttons Stack (WhatsApp & Instagram Side-by-Side, Close Button Below) */}
            <div className="flex flex-col gap-3 w-full shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* WhatsApp Button */}
                <MagneticButton className="w-full">
                  <motion.a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white focus-ring w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none rounded-2xl border-0 shadow-md shadow-emerald-600/20 transition-all duration-300"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-white" />
                    <span>WhatsApp</span>
                  </motion.a>
                </MagneticButton>

                {/* Instagram Button */}
                <MagneticButton className="w-full">
                  <motion.button
                    type="button"
                    onClick={handleInstagramShare}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white focus-ring w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none rounded-2xl border-0 shadow-md shadow-pink-600/20 transition-all duration-300"
                  >
                    <Instagram className="h-4 w-4 shrink-0 text-white" />
                    <span>{igToast ? "Tersalin!" : "Instagram"}</span>
                  </motion.button>
                </MagneticButton>
              </div>

              {/* Close Button */}
              <MagneticButton className="w-full">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="button-secondary-negative focus-ring w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer select-none rounded-2xl"
                >
                  <X className="h-4 w-4 shrink-0" />
                  <span>Tutup Modal</span>
                </motion.button>
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
