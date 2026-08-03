"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  LockKeyhole,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Timer,
  MessageCircle,
  Instagram,
  ArrowLeft,
  UnlockKeyhole,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderLock,
  BookOpen,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";
import { cn } from "@/lib/utils";

type AdminLoginViewProps = {
  onLoginSuccess: () => void;
};

export function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockCountdown, setBlockCountdown] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [isShakeError, setIsShakeError] = useState(false);

  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isEmptyWarning, setIsEmptyWarning] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shakeControls = useAnimation();

  // Focus username input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      usernameRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer effect for lockout
  useEffect(() => {
    if (blockCountdown === null || blockCountdown <= 0) return;

    const timer = setInterval(() => {
      setBlockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setErrorMsg("");
          setRemainingAttempts(null);
          setIsShakeError(false);
          setIsUsernameError(false);
          setIsPasswordError(false);
          setPassword("");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [blockCountdown]);

  const isBlocked = blockCountdown !== null && blockCountdown > 0;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (isUsernameError) setIsUsernameError(false);
    if (isPasswordError) setIsPasswordError(false);
    if (errorMsg) setErrorMsg("");
    if (isShakeError) setIsShakeError(false);
    if (isEmptyWarning) setIsEmptyWarning(false);
  };

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

  // Secret 3-tap (triple tap) reset on top icon orbit
  const handleLockTap = async () => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 3) {
      setResetTrigger(true);
      setTimeout(() => setResetTrigger(false), 900);

      setBlockCountdown(null);
      setRemainingAttempts(null);
      setErrorMsg("");
      setIsShakeError(false);
      setIsUsernameError(false);
      setIsPasswordError(false);
      setPassword("");

      try {
        await fetch("/api/admin/auth/dev-reset", { method: "POST" });
      } catch {}

      tapCountRef.current = 0;
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 450);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || isBlocked) return;

    const isUserEmpty = !username.trim();
    const isPassEmpty = !password;

    if (isUserEmpty || isPassEmpty) {
      setIsEmptyWarning(true);
      setIsUsernameError(isUserEmpty);
      setIsPasswordError(isPassEmpty);
      setErrorMsg(
        isUserEmpty && isPassEmpty
          ? "Nama pengguna dan kata sandi wajib diisi."
          : isUserEmpty
          ? "Nama pengguna wajib diisi."
          : "Kata sandi wajib diisi."
      );
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
    setErrorMsg("");
    setIsShakeError(false);
    setIsUsernameError(false);
    setIsPasswordError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember: true })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const remaining = data.remainingAttempts;
        const seconds = data.remainingSeconds;

        if (seconds && seconds > 0) {
          setBlockCountdown(seconds);
          setErrorMsg(data.error || "Batas 5 kali percobaan salah tercapai. Akses dibekukan selama 10 menit.");
          setIsUsernameError(true);
          setIsPasswordError(true);
        } else if (remaining !== undefined && remaining !== null) {
          setRemainingAttempts(remaining);
          setErrorMsg(data.error || `Kata sandi salah. Sisa percobaan aman: ${remaining} kali.`);

          if (data.usernameValid === false) {
            setIsUsernameError(true);
            setIsPasswordError(true);
          } else {
            setIsUsernameError(false);
            setIsPasswordError(true);
          }
        } else {
          setErrorMsg(data.error || "Nama pengguna atau kata sandi salah. Silakan coba lagi.");
          setIsUsernameError(true);
          setIsPasswordError(true);
        }

        setIsShakeError(true);
        shakeControls.start({
          x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
          rotate: [0, -3, 3, -2, 2, -1, 1, 0],
          scale: [1, 0.96, 1.02, 0.98, 1],
          transition: { duration: 0.52, ease: [0.36, 0.07, 0.19, 0.97] }
        });

        setLoading(false);
        return;
      }

      broadcastCrossTabEvent("ADMIN_LOGIN");
      onLoginSuccess();
    } catch {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      setIsShakeError(true);
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0],
        rotate: [0, -3, 3, -2, 2, -1, 1, 0],
        scale: [1, 0.96, 1.02, 0.98, 1],
        transition: { duration: 0.52, ease: [0.36, 0.07, 0.19, 0.97] }
      });
      setLoading(false);
    }
  };

  return (
    <div className="container-page pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-2rem)] flex flex-col justify-center relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-accent/8 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        {/* LEFT COLUMN: Facebook-Style Concept Hero Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 flex flex-col gap-6 text-left"
        >
          {/* Main Title */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
            Kelola Portofolio, Catatan, & Cerita dalam{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Satu Tempat.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base font-bold text-muted leading-relaxed max-w-xl">
            Ruang terisolasi khusus untuk mengelola private vault, materi persiapan ECL Deutsch B2, serta telemetry sistem portofolio Hajaturrachman.
          </p>

          {/* Showcase Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="soft-card p-4 rounded-2xl border border-line bg-surface/90 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="icon-orbit grid h-10 w-10 place-items-center rounded-xl border border-line bg-primary/10 text-primary">
                <FolderLock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-xs font-black text-text">Private Vault</h4>
                <p className="text-[11px] font-bold text-muted mt-0.5">Proteksi Akses Privat</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="soft-card p-4 rounded-2xl border border-line bg-surface/90 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="icon-orbit grid h-10 w-10 place-items-center rounded-xl border border-line bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-xs font-black text-text">ECL Deutsch B2</h4>
                <p className="text-[11px] font-bold text-muted mt-0.5">Modul & Bank Soal</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="soft-card p-4 rounded-2xl border border-line bg-surface/90 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="icon-orbit grid h-10 w-10 place-items-center rounded-xl border border-line bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-xs font-black text-text">Telemetry Logs</h4>
                <p className="text-[11px] font-bold text-muted mt-0.5">Audit Telemetri Real-time</p>
              </div>
            </motion.div>
          </div>

          {/* Security Status Pill */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-surface/80 border border-line p-3 text-xs font-bold text-muted w-fit mt-1 shadow-xs">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Sesi Terenkripsi AES-256 • Proteksi Cross-Tab Sync Terpadu</span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Admin Login Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <Reveal className="w-full max-w-lg">
            <motion.div className="premium-card w-full max-w-lg rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-line bg-surface shadow-2xl relative overflow-hidden">
          {/* Header Icon Orbit */}
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
                  boxShadow: "0 0 18px rgb(var(--color-primary) / 0.35)"
                },
                press: {
                  scale: 0.94,
                  rotate: 3,
                  borderColor: "rgb(var(--color-primary) / 0.72)",
                  boxShadow: "0 0 12px rgb(var(--color-primary) / 0.5)"
                }
              }}
              animate={
                resetTrigger
                  ? {
                      rotate: [0, 360, 720],
                      scale: [1, 1.3, 1],
                      borderColor: ["rgb(var(--color-line))", "rgb(16, 185, 129)", "rgb(var(--color-primary))"],
                      backgroundColor: [
                        "rgba(var(--color-primary), 0.1)",
                        "rgba(16, 185, 129, 0.3)",
                        "rgba(var(--color-primary), 0.1)"
                      ],
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
                    {isBlocked ? "Akses Dibekukan Sementara" : "Admin Control Center"}
                  </h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-muted">
                    {isBlocked
                      ? "Batas 5 kali percobaan salah tercapai. Akses dikunci sementara demi keamanan."
                      : "Portfolio v2.2 — Ruang Kendali Internal Terisolasi"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isBlocked ? (
              /* DEDICATED BLOCKED ACCESS VIEW (EXACT PASSWORD MODAL MATCH) */
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
                    <span>WAKTU PEMBEKUAN AKSES</span>
                  </div>

                  <div className="font-display text-4xl font-black text-rose-500 tracking-tight my-1">
                    {String(Math.floor((blockCountdown ?? 600) / 60)).padStart(2, "0")}:
                    {String((blockCountdown ?? 600) % 60).padStart(2, "0")}
                  </div>

                  <p className="text-xs font-bold text-rose-500/90 leading-5 mt-1">
                    Silakan tunggu hingga penghitung waktu selesai untuk mencoba kembali, atau hubungi Hajat.
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

                {/* Aligned Buttons Group */}
                <div className="flex flex-col gap-3 mt-1">
                  <MagneticButton className="w-full">
                    <motion.a
                      href={`https://wa.me/6285158518090?text=${encodeURIComponent(
                        "Halo Hajat, saya ingin mengonfirmasi akun admin saya."
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
                      className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-3.5 text-sm font-black cursor-pointer select-none shadow-md shadow-emerald-600/20 border-0 w-full"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span>Hubungi via WhatsApp</span>
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
                      className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white px-5 py-3.5 text-sm font-black cursor-pointer select-none shadow-md shadow-pink-600/20 border-0 w-full"
                    >
                      <Instagram className="h-4 w-4 shrink-0" />
                      <span>Hubungi via Instagram</span>
                    </motion.a>
                  </MagneticButton>

                  {/* Garis Pembatas */}
                  <div className="w-full border-t border-line/60 dark:border-line/40 my-3.5" />

                  <MagneticButton className="w-full">
                    <motion.button
                      type="button"
                      onClick={handleBackToHome}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -3 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-secondary-negative focus-ring w-full flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span>Kembali ke Beranda</span>
                    </motion.button>
                  </MagneticButton>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE FORM VIEW (EXACT PASSWORD MODAL MATCH) */
              <motion.div
                layout
                key="password-form"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <motion.div animate={shakeControls} className="flex flex-col gap-4">
                    {/* Username Field */}
                    <label className="grid gap-2 text-left">
                      <span className="text-sm font-black">Nama Pengguna</span>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted pointer-events-none" />
                        <input
                          type="text"
                          disabled={loading}
                          ref={usernameRef}
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            if (isEmptyWarning) setIsEmptyWarning(false);
                            if (isUsernameError) setIsUsernameError(false);
                            if (isPasswordError) setIsPasswordError(false);
                            if (errorMsg) setErrorMsg("");
                            if (isShakeError) setIsShakeError(false);
                          }}
                          onFocus={() => {
                            if (errorMsg) setErrorMsg("");
                            if (isEmptyWarning) setIsEmptyWarning(false);
                            if (isShakeError) setIsShakeError(false);
                            if (isUsernameError) setIsUsernameError(false);
                            if (isPasswordError) setIsPasswordError(false);
                          }}
                          placeholder="Masukkan nama pengguna admin"
                          className={cn(
                            "input pl-11 pr-4 text-left transition-all duration-300 w-full",
                            (isShakeError || isUsernameError) &&
                              (isEmptyWarning
                                ? "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5"
                                : "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5")
                          )}
                        />
                      </div>
                    </label>

                    {/* Password Field */}
                    <label className="grid gap-2 text-left">
                      <span className="text-sm font-black">Kata Sandi</span>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          name="secure_admin_pass"
                          id="secure_admin_pass"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                          className={cn(
                            "input pl-11 pr-12 text-left transition-all duration-300 w-full",
                            (isShakeError || isPasswordError) &&
                              (isEmptyWarning
                                ? "!border-amber-500 ring-4 ring-amber-500/25 shadow-glow shadow-amber-500/20 text-amber-500 dark:text-amber-400 bg-amber-500/5"
                                : "!border-rose-500 ring-4 ring-rose-500/25 shadow-glow shadow-rose-500/20 text-rose-500 dark:text-rose-400 bg-rose-500/5")
                          )}
                          placeholder="Masukkan kata sandi admin"
                          value={password}
                          onChange={handlePasswordChange}
                          onFocus={() => {
                            if (errorMsg) setErrorMsg("");
                            if (isEmptyWarning) setIsEmptyWarning(false);
                            if (isShakeError) setIsShakeError(false);
                            if (isUsernameError) setIsUsernameError(false);
                            if (isPasswordError) setIsPasswordError(false);
                          }}
                          disabled={loading}
                          ref={inputRef}
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleEyeToggle}
                          disabled={loading}
                          className="focus-ring absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-primary/10 hover:text-text disabled:opacity-50"
                          aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
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

                    {/* Error Banner (Exact Password Modal Match) */}
                    <AnimatePresence>
                      {errorMsg ? (
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
                              <span>{errorMsg}</span>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>

                  <MagneticButton className="w-full">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -3 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-primary shimmer-constant focus-ring mt-5 w-full flex items-center justify-center gap-2 border-0 cursor-pointer select-none"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Memverifikasi...</span>
                        </>
                      ) : (
                        <>
                          <UnlockKeyhole className="h-4 w-4 shrink-0" />
                          <span>Masuk Admin</span>
                        </>
                      )}
                    </motion.button>
                  </MagneticButton>

                  {/* Garis Pembatas */}
                  <div className="w-full border-t border-line/60 dark:border-line/40 my-3.5" />

                  <MagneticButton className="w-full">
                    <motion.button
                      type="button"
                      onClick={handleBackToHome}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -3 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="button-secondary-negative focus-ring w-full flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span>Kembali ke Beranda</span>
                    </motion.button>
                  </MagneticButton>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Reveal>
    </div>
  </div>
</div>
  );
}
