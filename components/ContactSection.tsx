"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { LocationConfirmModal } from "@/components/LocationConfirmModal";
import { MagneticButton } from "@/components/MagneticButton";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

export function ContactSection() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Location Confirmation Modal state
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    setStatus("");
    setIsSuccess(false);
    setSending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus(language === "id" ? "Pesan Anda berhasil dikirim secara aman!" : "Ihre Nachricht wurde erfolgreich gesendet!");
        setIsSuccess(true);
        form.reset();
      } else {
        setStatus(data.error || (language === "id" ? "Gagal mengirim pesan. Silakan coba lagi." : "Senden fehlgeschlagen. Bitte erneut versuchen."));
        setIsSuccess(false);
      }
    } catch (err) {
      setStatus(language === "id" ? "Gagal terhubung ke server. Periksa koneksi internet Anda." : "Verbindung fehlgeschlagen. Prüfen Sie das Internet.");
      setIsSuccess(false);
    } finally {
      setSending(false);
    }
  }

  const handleDomisiliClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };

  return (
    <>
      <Reveal id="contact" className="container-page section-space">
        <SectionHeader
          eyebrow={language === "id" ? "Kontak" : "Kontakt"}
          title={language === "id" ? "Mari terhubung untuk peluang karir atau kolaborasi." : "Lassen Sie uns für Karrieremöglichkeiten oder Zusammenarbeit vernetzen."}
          description={language === "id"
            ? "Silakan kirimkan saran, tawaran profesional, atau pesan lainnya. Pesan Anda akan langsung dikirim dan diproses secara aman."
            : "Senden Sie mir gerne Feedback, berufliche Angebote oder andere Nachrichten. Ihre Nachricht wird verschlüsselt übertragen."}
        />

        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="premium-card rounded-4xl p-5 sm:p-8">
            <h3 className="font-display text-2xl font-black">
              {language === "id" ? "Informasi Kontak" : "Kontaktdaten"}
            </h3>
            <p className="mt-3 leading-8 text-muted">
              {language === "id"
                ? "Kontak resmi dapat dihubungi melalui email, WhatsApp, atau Instagram."
                : "Offizielle Kontaktkanäle sind via E-Mail, WhatsApp oder Instagram erreichbar."}
            </p>

            <div className="mt-7 grid gap-4">
              <ContactLink
                icon={Mail}
                label="Email"
                value={siteConfig.email}
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.email}&su=${encodeURIComponent(
                  language === "id"
                    ? "Diskusi & Kontak Portofolio — [Nama]"
                    : "Portfolio-Anfrage & Kontakt — [Name]"
                )}&body=${encodeURIComponent(
                  language === "id"
                    ? "Halo Hajat,\n\nSaya [Nama], ingin menghubungi Anda mengenai..."
                    : "Hallo Hajat,\n\nich bin [Name] und möchte mich bezüglich Ihres Portfolios bei Ihnen melden..."
                )}`}
              />
              <ContactLink
                icon={Phone}
                label="WhatsApp"
                value={siteConfig.phone}
                href={`https://wa.me/62${siteConfig.phone.replace(/[^0-9]/g, "").substring(1)}?text=${encodeURIComponent(
                  language === "id"
                    ? "Halo Hajat, saya [Nama], saya tertarik dengan portofolio Anda dan ingin terhubung lebih lanjut."
                    : "Hallo Hajat, ich bin [Name]. Ich interessiere mich für Ihr Portfolio und möchte mich gerne mit Ihnen austauschen."
                )}`}
              />
              <ContactLink
                icon={Instagram}
                label="Instagram"
                value={siteConfig.instagram}
                href="https://instagram.com/saya.hajat"
              />
              <ContactLink
                icon={MapPin}
                label={language === "id" ? "Domisili" : "Wohnort"}
                value={siteConfig.location}
                href="https://maps.app.goo.gl/xmndeJxn1jGunPZFA"
                onClick={handleDomisiliClick}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="premium-card rounded-4xl p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black">{language === "id" ? "Nama" : "Name"}</span>
                <input
                  name="name"
                  className="input"
                  placeholder={language === "id" ? "Nama" : "Name"}
                  autoComplete="name"
                  disabled={sending}
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black">{language === "id" ? "Email" : "E-Mail"}</span>
                <input
                  type="email"
                  name="email"
                  className="input"
                  placeholder={language === "id" ? "Email" : "E-Mail"}
                  autoComplete="email"
                  disabled={sending}
                  required
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-sm font-black">{language === "id" ? "Pesan" : "Nachricht"}</span>
              <textarea
                name="message"
                className="input min-h-36 resize-none leading-7"
                placeholder={language === "id" ? "Tulis pesan Anda di sini..." : "Schreiben Sie Ihre Nachricht hier..."}
                disabled={sending}
                required
              />
            </label>

            {status ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-4 rounded-2xl p-4 text-sm font-bold leading-6",
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                )}
              >
                {status}
              </motion.div>
            ) : null}

            <MagneticButton className="w-full">
              <motion.button
                type="submit"
                disabled={sending}
                whileHover="hover"
                whileTap="press"
                variants={{
                  hover: { scale: 1.02, y: -2 },
                  press: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="button-primary shimmer-constant focus-ring mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm border-0"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === "id" ? "Mengirim..." : "Wird gesendet..."}
                  </>
                ) : (
                  <>
                    {language === "id" ? "Kirim Pesan" : "Nachricht senden"}
                    <motion.span
                      variants={{
                        hover: { x: 5, rotate: -15 },
                        press: { x: 5, rotate: -15 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="inline-flex items-center"
                    >
                      <Send className="h-4 w-4" />
                    </motion.span>
                  </>
                )}
              </motion.button>
            </MagneticButton>
          </form>
        </div>
      </Reveal>

      {/* Redirect warning modal for Domisili Map location */}
      <LocationConfirmModal
        open={modalOpen}
        targetName={language === "id" ? "Jakarta Timur, Indonesia" : "Ost-Jakarta, Indonesien"}
        targetUrl="https://maps.app.goo.gl/xmndeJxn1jGunPZFA"
        onConfirm={() => {
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <MagneticButton className="w-full">
      <motion.a
        href={href}
        onClick={onClick}
        whileHover="hover"
        whileTap="press"
        variants={{
          hover: { scale: 1.015, y: -2 },
          press: { scale: 0.975 }
        }}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
        className="group flex items-center gap-4 rounded-3xl border border-line bg-surface/82 p-4 cursor-pointer select-none text-text hover:border-primary/58 hover:bg-primary/5 hover:text-primary transition-colors duration-300 w-full"
      >
        <motion.div
          variants={{
            hover: { scale: 1.18, rotate: 10, boxShadow: "0 0 15px rgb(var(--color-primary) / 0.3)" },
            press: { scale: 0.9, rotate: 0 }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="icon-orbit grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line bg-primary/10 text-primary"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <span className="min-w-0">
          <span className="block text-xs font-black uppercase tracking-[0.18em] text-muted group-hover:text-primary/70">
            {label}
          </span>
          <span className="block break-all font-black text-sm sm:text-base">{value}</span>
        </span>
      </motion.a>
    </MagneticButton>
  );
}
