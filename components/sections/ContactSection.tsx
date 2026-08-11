"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";

import {
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  User,
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/layout/SectionHeader";
import dynamic from "next/dynamic";

const LocationConfirmModal = dynamic(
  () => import("@/components/modals/LocationConfirmModal").then((mod) => mod.LocationConfirmModal),
  { ssr: false }
);
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useSiteData } from "@/data/site";
import { useLanguage } from "@/components/providers/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";

type FieldErrorDetail = {
  message: string;
  type: "empty" | "invalid";
};

type FieldErrors = {
  name?: FieldErrorDetail;
  email?: FieldErrorDetail;
  message?: FieldErrorDetail;
};

export function ContactSection() {
  const { siteConfig } = useSiteData();
  const { language } = useLanguage();
  const [sending, setSending] = useState(false);

  // Form field states matching Admin Login & Password Modal
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Input refs for automatic error focus
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Shake animation controls matching Admin Login
  const shakeControls = useAnimation();

  // Location Confirmation Modal state
  const [modalOpen, setModalOpen] = useState(false);


  // Container ref for outside click detection
  const formContainerRef = useRef<HTMLFormElement>(null);

  // Clear validation error state when user clicks anywhere outside an active input field (inside or outside card)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !target.closest) return;
      if (!target.closest("input, textarea, button")) {
        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors({});
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [fieldErrors]);


  // Helper to clear error state for a field when user types
  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };


  const triggerFormSubmit = () => {
    if (formContainerRef.current) {
      formContainerRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    // Validate inputs locally matching Admin Login validation pattern
    const errors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      errors.name = {
        message: language === "id" ? "Nama lengkap wajib diisi." : "Vollständiger Name ist erforderlich.",
        type: "empty"
      };
    }

    if (!trimmedEmail) {
      errors.email = {
        message: language === "id" ? "Alamat email wajib diisi." : "E-Mail-Adresse ist erforderlich.",
        type: "empty"
      };
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = {
          message: language === "id" ? "Format alamat email tidak valid." : "Ungültiges E-Mail-Format.",
          type: "invalid"
        };
      }
    }

    if (!trimmedMessage) {
      errors.message = {
        message: language === "id" ? "Pesan Anda wajib diisi." : "Ihre Nachricht ist erforderlich.",
        type: "empty"
      };
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // Determine the combination of validation errors present
      const hasEmpty = Object.values(errors).some((err) => err?.type === "empty");
      const hasInvalid = Object.values(errors).some((err) => err?.type === "invalid");

      // Trigger field shake animation matching Admin Login View
      shakeControls.start({
        x: [0, -12, 12, -8, 8, -5, 5, -2, 2, 0],
        rotate: [0, -2, 2, -1, 1, 0],
        scale: [1, 0.97, 1.01, 0.99, 1],
        transition: { duration: 0.48, ease: [0.36, 0.07, 0.19, 0.97] }
      });

      // Auto-focus first error field
      if (errors.name) {
        nameRef.current?.focus();
      } else if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.message) {
        messageRef.current?.focus();
      }

      // Context-aware Toast notifications depending on exact error scenario
      if (hasEmpty && hasInvalid) {
        toast({
          message:
            language === "id"
              ? "Mohon lengkapi kolom yang kosong dan perbaiki format email Anda."
              : "Bitte füllen Sie leere Felder aus und korrigieren Sie das E-Mail-Format.",
          type: "error",
          title: language === "id" ? "Kolom Kosong & Format Salah" : "Unvollständige & Ungültige Felder"
        });
      } else if (hasInvalid) {
        toast({
          message:
            language === "id"
              ? "Format alamat email tidak valid. Silakan periksa kembali."
              : "Ungültiges E-Mail-Format. Bitte überprüfen Sie die Eingabe.",
          type: "error",
          title: language === "id" ? "Format Email Tidak Valid" : "Ungültiges E-Mail-Format"
        });
      } else {
        toast({
          message:
            language === "id"
              ? "Mohon lengkapi semua kolom yang wajib diisi."
              : "Bitte füllen Sie alle Pflichtfelder aus.",
          type: "amber",
          title: language === "id" ? "Kolom Belum Lengkap" : "Unvollständige Felder"
        });
      }
      return;
    }


    setSending(true);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot bot protection check
    const honeypot = String(formData.get("website_url") || "").trim();
    if (honeypot.length > 0) {
      const msg = language === "id" ? "Pesan Anda berhasil dikirim secara aman!" : "Ihre Nachricht wurde erfolgreich gesendet!";
      toast({ message: msg, type: "success", title: language === "id" ? "Pesan Terkirim!" : "Nachricht Gesendet!" });
      setSending(false);
      setName("");
      setEmail("");
      setMessage("");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, message: trimmedMessage }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const msg = language === "id" ? "Pesan Anda berhasil dikirim secara aman!" : "Ihre Nachricht wurde erfolgreich gesendet!";
        toast({ message: msg, type: "success", title: language === "id" ? "Pesan Terkirim!" : "Nachricht Gesendet!" });
        setName("");
        setEmail("");
        setMessage("");

        // Dispatch real-time cross-tab event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("contact_message_submitted"));
          broadcastCrossTabEvent("PUBLIC_MESSAGE_SUBMITTED", { name: trimmedName, timestamp: Date.now() });
        }
      } else {
        const errMsg = data.error || (language === "id" ? "Gagal mengirim pesan. Silakan coba lagi." : "Senden fehlgeschlagen. Bitte erneut versuchen.");
        toast({ message: errMsg, type: "error", title: language === "id" ? "Pengiriman Gagal" : "Fehler beim Senden" });
      }
    } catch {
      const connErr = language === "id" ? "Gagal terhubung ke server. Periksa koneksi internet Anda." : "Verbindung fehlgeschlagen. Prüfen Sie das Internet.";
      toast({ message: connErr, type: "error", title: language === "id" ? "Koneksi Terputus" : "Verbindungsfehler" });
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
      <Reveal id="contact" className="container-page section-space scroll-mt-28">
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
                    ? "Diskusi & Kontak Portofolio — [Nama Anda]"
                    : "Portfolio-Anfrage & Kontakt — [Ihr Name]"
                )}&body=${encodeURIComponent(
                  language === "id"
                    ? "Halo Hajat,\n\nPerkenalkan saya [Nama Anda]. Saya tertarik dengan portofolio Anda dan ingin menghubungi Anda mengenai...\n\nTerima kasih."
                    : "Hallo Hajat,\n\nich bin [Ihr Name]. Ich habe Ihr Portfolio gesehen und möchte mich bezüglich... bei Ihnen melden.\n\nVielen Dank."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              />
              <ContactLink
                icon={Phone}
                label="WhatsApp"
                value={siteConfig.phone}
                href={`https://wa.me/62${siteConfig.phone.replace(/[^0-9]/g, "").substring(1)}?text=${encodeURIComponent(
                  language === "id"
                    ? "Halo Hajat, perkenalkan saya [Nama Anda]. Saya tertarik dengan portofolio Anda dan ingin terhubung/berdiskusi lebih lanjut."
                    : "Hallo Hajat, ich bin [Ihr Name]. Ich interessiere mich für Ihr Portfolio und möchte mich gerne mit Ihnen austauschen."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              />
              <ContactLink
                icon={Instagram}
                label="Instagram"
                value={siteConfig.instagram}
                href="https://instagram.com/saya.hajat"
                target="_blank"
                rel="noopener noreferrer"
              />
              <ContactLink
                icon={MapPin}
                label={language === "id" ? "Domisili" : "Wohnort"}
                value={siteConfig.location}
                href="https://maps.app.goo.gl/xmndeJxn1jGunPZFA"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDomisiliClick}
              />
            </div>
          </div>

          <form ref={formContainerRef} onSubmit={handleSubmit} className="premium-card rounded-4xl p-5 sm:p-8" autoComplete="off" noValidate>

            {/* Honeypot Bot Trap Field */}
            <input
              type="text"
              name="website_url"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              defaultValue=""
            />

            <motion.div animate={shakeControls} className="flex flex-col gap-2">
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 items-start">
                {/* Nama Field */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center justify-between h-6 mb-1.5">
                    <label htmlFor="contact_name_field" className="text-sm font-black text-text cursor-pointer">
                      {language === "id" ? "Nama Lengkap" : "Vollständiger Name"}
                    </label>
                    <span className={cn(
                      "text-[11px] font-bold transition-colors",
                      fieldErrors.name?.type === "empty" ? "text-amber-500" : "text-muted/60"
                    )}>*</span>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted pointer-events-none" />
                    <input
                      id="contact_name_field"
                      ref={nameRef}
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearFieldError("name");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmedName = name.trim();
                          const trimmedEmail = email.trim();
                          const trimmedMessage = message.trim();

                          if (trimmedName && trimmedEmail && trimmedMessage) {
                            triggerFormSubmit();
                          } else if (!trimmedEmail) {
                            emailRef.current?.focus();
                          } else if (!trimmedMessage) {
                            messageRef.current?.focus();
                          } else if (!trimmedName) {
                            nameRef.current?.focus();
                          }
                        }
                      }}
                      placeholder={language === "id" ? "Contoh: Hajaturrachman" : "z.B. Hajaturrachman"}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="words"
                      spellCheck={false}
                      disabled={sending}
                      className={cn(
                        "input pl-11 pr-12 text-left transition-all duration-300 w-full",
                        fieldErrors.name?.type === "empty" && "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5",
                        fieldErrors.name?.type === "invalid" && "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5"
                      )}
                    />
                    <AnimatePresence>
                      {name && (
                        <motion.button
                          key="clear-name-btn"
                          type="button"
                          initial={{ opacity: 0, scale: 0.4, rotate: -60, y: "-50%" }}
                          animate={{ opacity: 1, scale: 1, rotate: 0, y: "-50%" }}
                          exit={{ opacity: 0, scale: 0.4, rotate: 60, y: "-50%" }}
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.85, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 450, damping: 24 }}
                          onClick={() => {
                            setName("");
                            clearFieldError("name");
                            nameRef.current?.focus();
                          }}
                          className="absolute right-2.5 top-1/2 rounded-full p-1 bg-surface-hover/90 hover:bg-rose-500/20 text-muted hover:text-rose-500 dark:hover:text-rose-400 border border-line/70 hover:border-rose-500/40 shadow-xs backdrop-blur-xs transition-colors cursor-pointer flex items-center justify-center"
                          aria-label="Hapus nama"
                        >
                          <X className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="min-h-[22px] mt-1 flex items-center">
                    <AnimatePresence mode="wait">
                      {fieldErrors.name && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={cn(
                            "text-xs font-bold flex items-center gap-1.5",
                            fieldErrors.name.type === "empty" ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                          )}
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{fieldErrors.name.message}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center justify-between h-6 mb-1.5">
                    <label htmlFor="contact_email_field" className="text-sm font-black text-text cursor-pointer">
                      {language === "id" ? "Alamat Email" : "E-Mail-Adresse"}
                    </label>
                    <span className={cn(
                      "text-[11px] font-bold transition-colors",
                      fieldErrors.email?.type === "empty" ? "text-amber-500" : fieldErrors.email?.type === "invalid" ? "text-rose-500" : "text-muted/60"
                    )}>*</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted pointer-events-none" />
                    <input
                      id="contact_email_field"
                      ref={emailRef}
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError("email");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmedName = name.trim();
                          const trimmedEmail = email.trim();
                          const trimmedMessage = message.trim();

                          if (trimmedName && trimmedEmail && trimmedMessage) {
                            triggerFormSubmit();
                          } else if (!trimmedMessage) {
                            messageRef.current?.focus();
                          } else if (!trimmedName) {
                            nameRef.current?.focus();
                          } else if (!trimmedEmail) {
                            triggerFormSubmit();
                          }
                        }
                      }}
                      placeholder={language === "id" ? "Contoh: nama@email.com" : "z.B. name@email.com"}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      disabled={sending}
                      className={cn(
                        "input pl-11 pr-12 text-left transition-all duration-300 w-full",
                        fieldErrors.email?.type === "empty" && "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5",
                        fieldErrors.email?.type === "invalid" && "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5"
                      )}
                    />
                    <AnimatePresence>
                      {email && (
                        <motion.button
                          key="clear-email-btn"
                          type="button"
                          initial={{ opacity: 0, scale: 0.4, rotate: -60, y: "-50%" }}
                          animate={{ opacity: 1, scale: 1, rotate: 0, y: "-50%" }}
                          exit={{ opacity: 0, scale: 0.4, rotate: 60, y: "-50%" }}
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.85, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 450, damping: 24 }}
                          onClick={() => {
                            setEmail("");
                            clearFieldError("email");
                            emailRef.current?.focus();
                          }}
                          className="absolute right-2.5 top-1/2 rounded-full p-1 bg-surface-hover/90 hover:bg-rose-500/20 text-muted hover:text-rose-500 dark:hover:text-rose-400 border border-line/70 hover:border-rose-500/40 shadow-xs backdrop-blur-xs transition-colors cursor-pointer flex items-center justify-center"
                          aria-label="Hapus email"
                        >
                          <X className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="min-h-[22px] mt-1 flex items-center">
                    <AnimatePresence mode="wait">
                      {fieldErrors.email && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={cn(
                            "text-xs font-bold flex items-center gap-1.5",
                            fieldErrors.email.type === "empty" ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                          )}
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{fieldErrors.email.message}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Message Field */}
              <div className="flex flex-col text-left mt-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label htmlFor="contact_message_field" className="text-sm font-black text-text cursor-pointer">
                    {language === "id" ? "Pesan Anda" : "Ihre Nachricht"}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted">{message.length} / 5000</span>
                    <span className={cn(
                      "text-[11px] font-bold transition-colors",
                      fieldErrors.message?.type === "empty" ? "text-amber-500" : "text-muted/60"
                    )}>*</span>
                  </div>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-4 h-4.5 w-4.5 text-muted pointer-events-none" />
                  <textarea
                    id="contact_message_field"
                    ref={messageRef}
                    name="message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearFieldError("message");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const trimmedName = name.trim();
                        const trimmedEmail = email.trim();
                        const trimmedMessage = message.trim();

                        if (trimmedName && trimmedEmail && trimmedMessage) {
                          triggerFormSubmit();
                        } else if (!trimmedName) {
                          nameRef.current?.focus();
                        } else if (!trimmedEmail) {
                          emailRef.current?.focus();
                        } else if (!trimmedMessage) {
                          messageRef.current?.focus();
                        }
                      }
                    }}

                    placeholder={language === "id" ? "Tuliskan detail pesan, saran, atau diskusi di sini..." : "Schreiben Sie Ihre Details hier..."}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={5000}
                    disabled={sending}
                    className={cn(
                      "input pl-11 pr-4 min-h-36 resize-none leading-7 transition-all duration-300 w-full",
                      fieldErrors.message?.type === "empty" && "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5",
                      fieldErrors.message?.type === "invalid" && "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5"
                    )}
                  />
                </div>

                <div className="min-h-[22px] mt-1 flex items-center">
                  <AnimatePresence mode="wait">
                    {fieldErrors.message && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                          "text-xs font-bold flex items-center gap-1.5",
                          fieldErrors.message.type === "empty" ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                        )}
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.message.message}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>



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
                className="button-primary shimmer-constant focus-ring mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm border-0 select-none cursor-pointer"
              >
                {sending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
                      className="inline-flex shrink-0"
                    >
                      <Loader2 className="h-5 w-5 text-white" />
                    </motion.span>
                    <span>{language === "id" ? "Mengirim Pesan..." : "Wird gesendet..."}</span>
                  </>
                ) : (
                  <>
                    <span>{language === "id" ? "Kirim Pesan" : "Nachricht senden"}</span>
                    <Send className="h-4 w-4 shrink-0" />
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
  target,
  rel,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
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
  );
}
