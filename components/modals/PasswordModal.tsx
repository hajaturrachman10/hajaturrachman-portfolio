"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Instagram,
  Lock,
  LockKeyhole,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Timer,
  UnlockKeyhole,
  Loader2
} from "lucide-react";
import { FormEvent, useEffect, useState, useRef, useCallback } from "react";

import { useLanguage } from "@/components/providers/LanguageContext";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type PasswordModalProps = {
  open: boolean;
  title: string;
  description: string;
  type: "cv" | "private-vault" | "ecl-material";
  successTitle?: string;
  successMessage?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function PasswordModal({
  open,
  title,
  description,
  type,
  successTitle,
  successMessage,
  onClose,
  onSuccess
}: PasswordModalProps) {
  const { language } = useLanguage();
  const resolvedSuccessTitle = successTitle || (language === "id" ? "Akses Terbuka" : "Zugriff freigeschaltet");
  const resolvedSuccessMessage = successMessage || (language === "id" ? "Kata sandi benar. Selamat datang." : "Passwort verifiziert. Willkommen.");
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blockCountdown, setBlockCountdown] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isShakeError, setIsShakeError] = useState(false);
  const [isEmptyWarning, setIsEmptyWarning] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeControls = useAnimation();

  // Secure Close Handler to clear values and blur to prevent Google Password Manager popups
  const handleClose = useCallback(() => {
    setPassword("");
    inputRef.current?.blur();
    onClose();
  }, [onClose]);

  // Lock body scroll and trap keyboard focus when password modal is open
  useEffect(() => {
    if (!open) return;
    lockScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
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
  }, [open, handleClose]);



  // Load attempts from localStorage and reset form state when modal opens
  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
      setIsShakeError(false);
      setSuccess(false);
      const savedAttempts = localStorage.getItem(`attempts_${type}`);
      setAttempts(savedAttempts ? parseInt(savedAttempts, 10) : 0);

      const remainingSec = getRemainingLockoutSeconds(type);
      setBlockCountdown(remainingSec > 0 ? remainingSec : null);

      if (remainingSec <= 0) {
        localStorage.removeItem(`lockout_until_${type}`);
      }
    }
  }, [open, type]);

  // Live countdown timer for blocked access
  useEffect(() => {
    if (blockCountdown === null) return;

    const checkTimer = () => {
      const remainingSec = getRemainingLockoutSeconds(type);
      if (remainingSec <= 0) {
        setAttempts(0);
        localStorage.removeItem(`attempts_${type}`);
        localStorage.removeItem(`lockout_until_${type}`);
        setBlockCountdown(null);
        setError("");
        setIsShakeError(false);
        setPassword("");
      } else {
        setBlockCountdown(remainingSec);
      }
    };

    checkTimer();
    const timer = setInterval(checkTimer, 1000);
    return () => clearInterval(timer);
  }, [blockCountdown, type]);

  // Helper to compute remaining lockout seconds based on real-time timestamps
  const getRemainingLockoutSeconds = (authType: string): number => {
    const storedUntil = localStorage.getItem(`lockout_until_${authType}`);
    if (!storedUntil) return 0;
    const until = parseInt(storedUntil, 10);
    const now = Date.now();
    const diffMs = until - now;
    if (diffMs <= 0) {
      localStorage.removeItem(`lockout_until_${authType}`);
      localStorage.removeItem(`attempts_${authType}`);
      return 0;
    }
    return Math.ceil(diffMs / 1000);
  };

  const setLockoutUntilTimestamp = (authType: string, seconds: number) => {
    const until = Date.now() + seconds * 1000;
    localStorage.setItem(`lockout_until_${authType}`, until.toString());
    localStorage.setItem(`attempts_${authType}`, "5");
  };

  // Preserve cursor position during input change to eliminate cursor jumping to front
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    setPassword(val);
    if (error) setError(""); // Clear error state on typing so input outline returns to normal
    if (isEmptyWarning) setIsEmptyWarning(false);
    if (isShakeError) setIsShakeError(false);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        // If caret unexpectedly jumped to 0 while text exists, force to end of text
        const safeStart = (start === 0 && val.length > 0) ? val.length : (start ?? val.length);
        const safeEnd = (end === 0 && val.length > 0) ? val.length : (end ?? val.length);
        inputRef.current.setSelectionRange(safeStart, safeEnd);
      }
    });
  };

  // Preserve cursor position during showPassword toggle
  const handleEyeToggle = () => {
    const input = inputRef.current;
    const start = input?.selectionStart;
    const end = input?.selectionEnd;

    setShowPassword((prev) => !prev);

    setTimeout(() => {
      if (input) {
        input.focus();
        if (start !== undefined && end !== undefined && start !== null && end !== null) {
          input.setSelectionRange(start, end);
        }
      }
    }, 0);
  };

  // Secret emergency 3-tap (triple tap) reset for Hajat
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLockTap = async () => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 3) {
      setResetTrigger(true);
      setTimeout(() => setResetTrigger(false), 900);

      // Full client & server reset on 3 taps
      localStorage.removeItem(`attempts_${type}`);
      localStorage.removeItem(`lockout_until_${type}`);
      setAttempts(0);
      setBlockCountdown(null);
      setError("");
      setIsShakeError(false);
      setPassword("");

      // Reset server IP rate limit map (Requires current input password or admin session)
      try {
        await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset", type, password })
        });
      } catch {}


      tapCountRef.current = 0;
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 450); // 450ms window for triple tap
    }
  };

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    if (loading) return;

    if (attempts >= 5 || (blockCountdown !== null && blockCountdown > 0)) {
      setError(
        language === "id"
          ? "Akses dibekukan sementara demi keamanan."
          : "Der Zugriff ist aus Sicherheitsgründen vorübergehend gesperrt."
      );
      return;
    }

    if (!password || !password.trim()) {
      setIsEmptyWarning(true);
      setError(language === "id" ? "Kata sandi wajib diisi." : "Bitte Passwort eingeben.");
      setIsShakeError(true);
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        rotate: [0, -3, 3, -2, 2, -1, 1, 0],
        scale: [1, 0.96, 1.02, 0.98, 1],
        transition: { duration: 0.52, ease: [0.36, 0.07, 0.19, 0.97] }
      });
      return;
    }

    setIsEmptyWarning(false);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setError("");
        setSuccess(true);
        localStorage.removeItem(`attempts_${type}`);
        localStorage.removeItem(`lockout_until_${type}`);
        setAttempts(0);
        setBlockCountdown(null);

        window.setTimeout(() => {
          setPassword("");
          setSuccess(false);
          setLoading(false);
          onSuccess();
        }, 950);
      } else {
        if (response.status === 429) {
          setPassword("");
          inputRef.current?.blur();
          setLockoutUntilTimestamp(type, 600);
          setAttempts(5);
          setBlockCountdown(600);
          const errMsg = data.error || (language === "id"
            ? "Batas 5 kali percobaan tercapai. Akses dibekukan selama 10 menit."
            : "Versuchslimit (5) erreicht. Zugriff für 10 Minuten gesperrt.");
          setError(errMsg);
        } else {
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);
          localStorage.setItem(`attempts_${type}`, nextAttempts.toString());

          if (nextAttempts >= 5) {
            setPassword("");
            inputRef.current?.blur();
            setLockoutUntilTimestamp(type, 600);
            setBlockCountdown(600);
            const errMsg = language === "id"
              ? "Batas 5 kali percobaan salah tercapai. Akses dibekukan selama 10 menit."
              : "Versuchslimit (5) erreicht. Zugriff für 10 Minuten gesperrt.";
            setError(errMsg);
          } else {
            const errMsg = data.error || (language === "id"
              ? "Kata sandi salah. Silakan coba lagi."
              : "Falsches Passwort. Bitte versuchen Sie es erneut.");
            setError(errMsg);
            setShakeTrigger((prev) => prev + 1);
            setIsShakeError(true);
            shakeControls.start({
              x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
              rotate: [0, -3, 3, -2, 2, -1, 1, 0],
              scale: [1, 0.96, 1.02, 0.98, 1],
              transition: { duration: 0.52, ease: [0.36, 0.07, 0.19, 0.97] }
            });
          }
        }
        setLoading(false);
      }
    } catch {
      setError(
        language === "id"
          ? "Gagal terhubung ke server. Periksa koneksi internet Anda."
          : "Verbindung fehlgeschlagen. Überprüfen Sie Ihre Internetverbindung."
      );
      setShakeTrigger((prev) => prev + 1);
      setIsShakeError(true);
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        rotate: [0, -3, 3, -2, 2, -1, 1, 0],
        scale: [1, 0.96, 1.02, 0.98, 1],
        transition: { duration: 0.52, ease: [0.36, 0.07, 0.19, 0.97] }
      });
      setLoading(false);
    }
  }

  const isBlocked = attempts >= 5 || (blockCountdown !== null && blockCountdown > 0);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop fixed inset-0 z-[120] grid place-items-center px-4 py-8 transform-gpu will-change-[opacity]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
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
            className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden transform-gpu will-change-[transform,opacity]"
          >
            <AnimatePresence mode="wait">
              {success ? (
                /* SUCCESS STATE VIEW */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.75, ease: "easeInOut" }}
                    className="relative grid h-20 w-20 place-items-center rounded-3xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shadow-glow shadow-emerald-500/25"
                  >
                    <Sparkles className="h-10 w-10 animate-pulse" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                      className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-md"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </motion.div>
                  </motion.div>
                  <h3 className="mt-6 font-display text-3xl font-black gradient-text">
                    {resolvedSuccessTitle}
                  </h3>
                  <p className="mt-3 font-bold leading-7 text-muted max-w-xs">
                    {resolvedSuccessMessage}
                  </p>
                </motion.div>
              ) : (
                /* MAIN FORM & BLOCKED STATE VIEW */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <motion.div
                        onClick={handleLockTap}
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: {
                            scale: 1.06,
                            rotate: 6,
                            borderColor: "rgb(var(--color-primary) / 0.56)",
                            boxShadow: "0 0 18px rgb(var(--color-primary) / 0.35)",
                            transition: { type: "spring", stiffness: 450, damping: 18 }
                          },
                          press: {
                            scale: 0.94,
                            rotate: 3,
                            borderColor: "rgb(var(--color-primary) / 0.72)",
                            boxShadow: "0 0 12px rgb(var(--color-primary) / 0.5)",
                            transition: { type: "spring", stiffness: 450, damping: 18 }
                          }
                        }}
                        animate={
                          resetTrigger
                            ? {
                                rotate: [0, 360, 720],
                                scale: [1, 1.3, 1],
                                borderColor: ["rgb(var(--color-line))", "rgb(16, 185, 129)", "rgb(var(--color-primary))"],
                                backgroundColor: ["rgba(var(--color-primary), 0.1)", "rgba(16, 185, 129, 0.3)", "rgba(var(--color-primary), 0.1)"],
                                color: ["rgb(var(--color-primary))", "rgb(16, 185, 129)", "rgb(var(--color-primary))"]
                              }
                            : isBlocked
                            ? {
                                scale: 1,
                                rotate: 0,
                                borderColor: "rgb(239 68 68 / 0.4)",
                                backgroundColor: "rgb(239 68 68 / 0.12)",
                                color: "rgb(239 68 68)"
                              }
                            : {
                                scale: 1,
                                rotate: 0,
                                borderColor: "rgb(var(--color-line))",
                                backgroundColor: "rgba(var(--color-primary), 0.1)",
                                color: "rgb(var(--color-primary))"
                              }
                        }
                        transition={resetTrigger ? { duration: 0.9, ease: "easeInOut" } : { duration: 0.3 }}
                        title={language === "id" ? "Ketuk 3 kali untuk atur ulang darurat (Khusus Hajat)" : "Dreimal tippen für Notfall-Zusatz (Nur Hajat)"}
                        className="icon-orbit grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl border border-line bg-primary/10 text-primary cursor-pointer select-none"
                      >
                        {isBlocked ? <ShieldAlert className="h-7 w-7 animate-pulse text-rose-500" /> : <LockKeyhole className="h-7 w-7" />}
                      </motion.div>

                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isBlocked ? "locked" : "normal"}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                        >
                          <h3 className="font-display text-2xl font-black">
                            {isBlocked
                              ? (language === "id" ? "Akses Dibekukan Sementara" : "Zugriff vorübergehend gesperrt")
                              : title}
                          </h3>
                          <p className="mt-2 text-sm font-bold leading-6 text-muted">
                            {isBlocked
                              ? (language === "id"
                                  ? "Batas 5 kali percobaan salah tercapai. Akses dikunci sementara demi keamanan."
                                  : "Versuchslimit (5) erreicht. Der Zugriff ist aus Sicherheitsgründen vorübergehend gesperrt.")
                              : description}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isBlocked ? (
                      /* DEDICATED BLOCKED ACCESS MODAL VIEW (NO INPUT, NO SUBMIT BUTTON) */
                      <motion.div
                        key="locked-panel"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-6 flex flex-col gap-4"
                      >
                        {/* Countdown Badge & Progress Box */}
                        <div className="flex flex-col items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/25 p-5 text-center shadow-glow shadow-rose-500/10">
                          <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest mb-1">
                            <Timer className="h-4 w-4 animate-spin" style={{ animationDuration: "3s" }} />
                            <span>{language === "id" ? "Waktu Pembekuan Akses" : "Sperrzeit-Countdown"}</span>
                          </div>
                          
                          <div className="font-display text-4xl font-black text-rose-500 tracking-tight my-1">
                            {String(Math.floor((blockCountdown ?? 600) / 60)).padStart(2, "0")}:
                            {String((blockCountdown ?? 600) % 60).padStart(2, "0")}
                          </div>

                          <p className="text-xs font-bold text-rose-500/90 leading-5 mt-1">
                            {language === "id"
                              ? "Silakan tunggu hingga penghitung waktu selesai untuk mencoba kembali, atau hubungi Hajat."
                              : "Bitte warten Sie, bis der Countdown abläuft, um es erneut zu versuchen."}
                          </p>

                          {/* Progress bar animation */}
                          <div className="w-full bg-rose-500/20 h-2 rounded-full mt-4 overflow-hidden">
                            <motion.div
                              className="bg-rose-500 h-full rounded-full"
                              initial={{ width: "100%" }}
                              animate={{ width: `${((blockCountdown ?? 600) / 600) * 100}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                        </div>

                        {/* Aligned, Uniform & Fully Animated Buttons Group */}
                        <div className="flex flex-col gap-3 mt-1">
                          <MagneticButton className="w-full">
                            <motion.a
                              href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                                 language === "id"
                                   ? "Halo Hajat, perkenalkan saya [Nama Anda]. Akses kata sandi saya terkunci karena salah 5 kali. Bisakah minta tolong dibantu dipulihkan? Terima kasih."
                                   : "Hallo Hajat, ich bin [Ihr Name]. Mein Passwort-Zugang wurde nach 5 Fehlversuchen gesperrt. Könnten Sie mir bitte helfen, den Zugang wieder freizuschalten? Vielen Dank."
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover="hover"
                              whileTap="press"
                              variants={{
                                hover: {
                                  scale: 1.03,
                                  y: -3,
                                  backgroundColor: "#059669",
                                  boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)"
                                },
                                press: {
                                  scale: 0.95,
                                  y: 1,
                                  backgroundColor: "#047857",
                                  boxShadow: "0 4px 6px rgba(16, 185, 129, 0.1)"
                                }
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 12 }}
                              className="flex items-center justify-center gap-2.5 rounded-full bg-emerald-600 text-white px-5 py-3.5 text-sm font-black cursor-pointer select-none shadow-md shadow-emerald-600/20 border-0 w-full"
                            >
                              <motion.span
                                variants={{
                                  hover: { scale: 1.25, rotate: 12 },
                                  press: { scale: 0.85, rotate: 0 }
                                }}
                                transition={{ type: "spring", stiffness: 450, damping: 10 }}
                                className="inline-flex items-center"
                              >
                                <MessageCircle className="h-5 w-5" />
                              </motion.span>
                              <span>{language === "id" ? "Hubungi via WhatsApp" : "Kontakt via WhatsApp"}</span>
                            </motion.a>
                          </MagneticButton>

                          <MagneticButton className="w-full">
                            <motion.a
                              href="https://instagram.com/saya.hajat"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover="hover"
                              whileTap="press"
                              variants={{
                                hover: {
                                  scale: 1.03,
                                  y: -3,
                                  filter: "brightness(1.1)",
                                  boxShadow: "0 10px 20px rgba(219, 39, 119, 0.35)"
                                },
                                press: {
                                  scale: 0.95,
                                  y: 1,
                                  filter: "brightness(0.85)",
                                  boxShadow: "0 4px 6px rgba(219, 39, 119, 0.15)"
                                }
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 12 }}
                              className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white px-5 py-3.5 text-sm font-black cursor-pointer select-none shadow-md shadow-pink-600/20 border-0 w-full"
                            >
                              <motion.span
                                variants={{
                                  hover: { scale: 1.25, rotate: -12 },
                                  press: { scale: 0.85, rotate: 0 }
                                }}
                                transition={{ type: "spring", stiffness: 450, damping: 10 }}
                                className="inline-flex items-center"
                              >
                                <Instagram className="h-5 w-5" />
                              </motion.span>
                              <span>{language === "id" ? "Hubungi via Instagram" : "Kontakt via Instagram"}</span>
                            </motion.a>
                          </MagneticButton>

                          <MagneticButton className="w-full">
                            <motion.button
                              type="button"
                              onClick={handleClose}
                              whileHover="hover"
                              whileTap="press"
                              variants={{
                                hover: {
                                  scale: 1.03,
                                  y: -3,
                                  borderColor: "rgba(239, 68, 68, 0.5)",
                                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                                  boxShadow: "0 8px 16px rgba(239, 68, 68, 0.15)"
                                },
                                press: {
                                  scale: 0.95,
                                  y: 1,
                                  borderColor: "rgb(239, 68, 68)",
                                  backgroundColor: "rgba(239, 68, 68, 0.25)",
                                  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)"
                                }
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 12 }}
                              className="button-secondary-negative focus-ring w-full mt-3 flex items-center justify-center gap-2 cursor-pointer select-none"
                            >
                              <motion.span
                                variants={{
                                  hover: { x: -4 },
                                  press: { x: -1 }
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                                className="inline-flex items-center"
                              >
                                <ArrowLeft className="h-4 w-4 !transform-none" />
                              </motion.span>
                              <span>{language === "id" ? "Kembali" : "Zurück"}</span>
                            </motion.button>
                          </MagneticButton>
                        </div>
                      </motion.div>
                    ) : (
                      /* ACTIVE PASSWORD INPUT FORM VIEW */
                      <motion.div
                        layout
                        key="password-form"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-6"
                      >
                          <motion.div animate={shakeControls} className="flex flex-col gap-4">
                            <label className="grid gap-2 text-left">
                              <span className="text-sm font-black">{language === "id" ? "Kata Sandi" : "Passwort"}</span>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted pointer-events-none" />
                                {/* Decoy fields to block Chrome / Google Password Manager popups */}
                                <input type="text" name="fake_user" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                                <input type="password" name="fake_pass" style={{ display: "none" }} tabIndex={-1} autoComplete="new-password" />
                                <input
                                  type="text"
                                  style={{
                                    WebkitTextSecurity: showPassword ? "none" : "disc"
                                  } as React.CSSProperties}
                                  readOnly={isReadOnly}
                                  autoComplete="off"
                                  aria-autocomplete="none"
                                  data-lpignore="true"
                                  data-1p-ignore="true"
                                  data-bwignore="true"
                                  data-form-type="other"
                                  name="secure_vault_pin"
                                  id="secure_vault_pin"
                                  autoCapitalize="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  className={cn(
                                    "input pl-11 pr-12 text-left transition-all duration-300 w-full",
                                    (isShakeError || Boolean(error)) &&
                                      (isEmptyWarning
                                        ? "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5"
                                        : "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5")
                                  )}
                                  placeholder={language === "id" ? "Masukkan kata sandi" : "Passwort eingeben"}
                                  value={password}
                                  onChange={handlePasswordChange}
                                  onFocus={(e) => {
                                    setIsReadOnly(false);
                                    if (error) setError("");
                                    if (isEmptyWarning) setIsEmptyWarning(false);
                                    if (isShakeError) setIsShakeError(false);
                                    const target = e.target;
                                    requestAnimationFrame(() => {
                                      if (target.value.length > 0 && target.selectionStart === 0 && target.selectionEnd === 0) {
                                        target.setSelectionRange(target.value.length, target.value.length);
                                      }
                                    });
                                  }}
                                  onClick={(e) => {
                                    const target = e.currentTarget;
                                    if (target.value.length > 0 && target.selectionStart === 0 && target.selectionEnd === 0) {
                                      target.setSelectionRange(target.value.length, target.value.length);
                                    }
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      handleSubmit();
                                    }
                                  }}
                                  disabled={loading}
                                  ref={inputRef}
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    // Prevent input from losing focus and closing keyboard
                                    e.preventDefault();
                                  }}
                                  onClick={handleEyeToggle}
                                  disabled={loading}
                                  className="focus-ring absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-primary/10 hover:text-text disabled:opacity-50"
                                  aria-label={showPassword ? (language === "id" ? "Sembunyikan kata sandi" : "Passwort ausblenden") : (language === "id" ? "Lihat kata sandi" : "Passwort anzeigen")}
                                >
                                  <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                      key={showPassword ? "eye-off" : "eye"}
                                      initial={{ opacity: 0, scale: 0.8, rotate: -25 }}
                                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                      exit={{ opacity: 0, scale: 0.8, rotate: 25 }}
                                      transition={{ duration: 0.15 }}
                                      className="inline-flex items-center justify-center"
                                    >
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </motion.span>
                                  </AnimatePresence>
                                </button>
                              </div>
                            </label>

                            <AnimatePresence>
                              {error ? (
                                <motion.div
                                  key="error-banner"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-1.5 pb-1 px-0.5">
                                    <div
                                      className={cn(
                                        "flex items-center justify-center gap-2 rounded-2xl p-3 text-xs sm:text-sm font-black text-center shadow-glow shadow-5/5",
                                        isEmptyWarning
                                          ? "bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 shadow-amber-500/5"
                                          : "bg-rose-500/10 border border-rose-500/25 text-rose-500 shadow-rose-500/5"
                                      )}
                                    >
                                      <motion.span
                                        animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.25, 1] }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="inline-flex shrink-0"
                                      >
                                        <AlertCircle className={cn("h-4.5 w-4.5", isEmptyWarning ? "text-amber-500 dark:text-amber-400" : "text-rose-500")} />
                                      </motion.span>
                                      <span>{error}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </motion.div>

                          <MagneticButton className="w-full">
                            <motion.button
                              type="button"
                              onClick={() => handleSubmit()}
                              disabled={loading}
                              whileHover="hover"
                              whileTap="press"
                              variants={{
                                hover: { scale: 1.03, y: -3 },
                                press: { scale: 0.95 }
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 12 }}
                              className="button-primary shimmer-constant focus-ring mt-5 w-full flex items-center justify-center gap-2 border-0"
                            >
                              {loading ? (
                                <>
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
                                    className="inline-flex shrink-0"
                                  >
                                    <Loader2 className="h-5 w-5 text-white" />
                                  </motion.span>
                                  <span>{language === "id" ? "Memverifikasi..." : "Überprüfen..."}</span>
                                </>
                              ) : (
                                <>
                                  <UnlockKeyhole className="h-4 w-4 shrink-0" />
                                  <span>{language === "id" ? "Buka Akses" : "Freischalten"}</span>
                                </>
                              )}
                            </motion.button>
                          </MagneticButton>

                          <MagneticButton className="w-full">
                            <motion.button
                              type="button"
                              onClick={handleClose}
                              disabled={loading}
                              whileHover="hover"
                              whileTap="press"
                              variants={{
                                hover: { scale: 1.03, y: -3 },
                                press: { scale: 0.95 }
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 12 }}
                              className="button-secondary-negative focus-ring w-full mt-3 flex items-center justify-center gap-2 cursor-pointer select-none"
                            >
                              <ArrowLeft className="h-4 w-4 shrink-0" />
                              <span>{language === "id" ? "Kembali" : "Zurück"}</span>
                            </motion.button>
                          </MagneticButton>

                          <p className="mt-4 text-xs font-bold leading-6 text-muted text-center">
                            <a
                              href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                                language === "id"
                                  ? "Halo Hajat, saya [Nama]. Saya lupa kata sandi untuk mengakses portofolio Anda. Apakah bisa dibantu?"
                                  : "Hallo Hajat, ich bin [Name]. Ich habe das Passwort untuk mengakses portofolio Anda. Apakah bisa dibantu?"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-black cursor-pointer"
                            >
                              {language === "id" ? "Lupa kata sandi? Hubungi via WhatsApp." : "Passwort vergessen? Per WhatsApp kontaktieren."}
                            </a>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
