"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Lock, Save, AlertCircle, CheckCircle2, KeyRound, Check, X, Play, ChevronDown, Plus, Trash2, ShieldCheck, Key, Edit3 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { broadcastCrossTabEvent } from "@/lib/crossTabSync";
import { FeatureType, AdminAccount } from "@/services/admin/adminTypes";
import { StrategyType, PasswordStrategyConfig } from "@/services/admin/passwordEngine";
import { cn } from "@/lib/utils";

type AdminSettingsTabProps = {
  currentUsername: string;
  onRefresh: () => void;
};

const STRATEGY_OPTIONS: Array<{ key: StrategyType; label: string; desc: string }> = [
  { key: "STATIC", label: "STATIC (Exact Match)", desc: "Kata sandi harus persis sama dengan kunci rahasia." },
  { key: "YEAR_RANGE", label: "YEAR_RANGE (Base + Tahun)", desc: "Verifikasi berdasarkan string dasar + rentang tahun." },
  { key: "MULTIPLE", label: "MULTIPLE (Daftar Kunci)", desc: "Daftar beberapa kata sandi alternatif yang sah." },
  { key: "PREFIX", label: "PREFIX (Awalan Kunci)", desc: "Kata sandi yang diawali dengan klausa rahasia." },
  { key: "SUFFIX", label: "SUFFIX (Akhiran Kunci)", desc: "Kata sandi yang diakhiri dengan klausa rahasia." },
  { key: "REGEX", label: "REGEX (Pola Ekspresi)", desc: "Verifikasi menggunakan ekspresi reguler khusus." }
];

export function AdminSettingsTab({ currentUsername, onRefresh }: AdminSettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Accounts Management State
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [newAccUser, setNewAccUser] = useState("");
  const [newAccPass, setNewAccPass] = useState("");
  const [newAccRole, setNewAccRole] = useState<"SUPER_ADMIN" | "ADMIN" | "AUDITOR">("ADMIN");

  // Add Password to Account State
  const [activeAddPassAccId, setActiveAddPassAccId] = useState<string | null>(null);
  const [additionalPasswordInput, setAdditionalPasswordInput] = useState("");

  // Edit Account State
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editUsernameInput, setEditUsernameInput] = useState("");
  const [editRoleInput, setEditRoleInput] = useState<"SUPER_ADMIN" | "ADMIN" | "AUDITOR">("ADMIN");

  // Password Strategy State
  const [selectedResource, setSelectedResource] = useState<FeatureType>("cv");
  const [strategyType, setStrategyType] = useState<StrategyType>("STATIC");
  const [strategyAccordionOpen, setStrategyAccordionOpen] = useState(false);

  const [staticPassword, setStaticPassword] = useState("cvhajat2026");
  const [yearBase, setYearBase] = useState("10juli");
  const [startYear, setStartYear] = useState(2006);
  const [endYear, setEndYear] = useState(2026);
  const [multiplePasswords, setMultiplePasswords] = useState("abc, def, ghi");
  const [prefixText, setPrefixText] = useState("hajat");
  const [suffixText, setSuffixText] = useState("2026");
  const [regexPattern, setRegexPattern] = useState("^[a-z]+2026$");

  // Preview Validator State
  const [testPasswordInput, setTestPasswordInput] = useState("");
  const [testResult, setTestResult] = useState<{ evaluated: boolean; valid: boolean } | null>(null);

  // Confirm Modal State
  const [modalConfig, setModalConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    icon?: typeof Save;
    iconClassName?: string;
    confirmButtonClassName?: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {}
  });

  // Fetch accounts & strategies
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/accounts");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        }
      }
    } catch {
      // handle silently
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    async function loadStrategies() {
      try {
        const res = await fetch("/api/admin/strategies");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.strategies) {
            const current = data.strategies[selectedResource];
            if (current) {
              setStrategyType(current.type);
              if (current.type === "STATIC") setStaticPassword(current.password || "");
              if (current.type === "YEAR_RANGE") {
                setYearBase(current.base || "");
                setStartYear(current.startYear || 2006);
                setEndYear(current.endYear || 2026);
              }
              if (current.type === "MULTIPLE") setMultiplePasswords((current.passwords || []).join(", "));
              if (current.type === "PREFIX") setPrefixText(current.prefix || "");
              if (current.type === "SUFFIX") setSuffixText(current.suffix || "");
              if (current.type === "REGEX") setRegexPattern(current.pattern || "");
            }
          }
        }
      } catch {
        // Handle error silently
      }
    }
    loadStrategies();
  }, [selectedResource]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccUser || !newAccPass || newAccUser.length < 3 || newAccPass.length < 6) {
      setFeedback({ type: "error", text: "Username minimal 3 karakter dan Kata sandi minimal 6 karakter." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newAccUser, password: newAccPass, role: newAccRole })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Akun admin baru "${newAccUser}" berhasil ditambahkan!` });
        setNewAccUser("");
        setNewAccPass("");
        setShowAddAccountForm(false);
        fetchAccounts();
        onRefresh();
      } else {
        setFeedback({ type: "error", text: data.error || "Gagal menambahkan akun admin." });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan koneksi." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPasswordToAccount = async (accountId: string) => {
    if (!additionalPasswordInput || additionalPasswordInput.trim().length < 6) {
      setFeedback({ type: "error", text: "Kata sandi tambahan minimal 6 karakter." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accountId, action: "addPassword", value: additionalPasswordInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: "Kata sandi tambahan berhasil ditambahkan!" });
        setAdditionalPasswordInput("");
        setActiveAddPassAccId(null);
        fetchAccounts();
        onRefresh();
      } else {
        setFeedback({ type: "error", text: data.error || "Gagal menambahkan password." });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan koneksi." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePasswordFromAccount = (accountId: string, passValue: string) => {
    setModalConfig({
      open: true,
      title: "Hapus Kata Sandi?",
      description: `Apakah Anda yakin ingin menghapus kata sandi "${passValue}" dari akun ini?`,
      confirmLabel: "Ya, Hapus Password",
      icon: Trash2,
      iconClassName: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20",
      confirmButtonClassName: "button-primary !bg-rose-600 hover:!bg-rose-500 shadow-md shadow-rose-600/20",
      action: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/admin/accounts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: accountId, action: "removePassword", value: passValue })
          });
          const data = await res.json();
          if (data.success) {
            setFeedback({ type: "success", text: "Kata sandi berhasil dihapus!" });
            fetchAccounts();
            onRefresh();
          } else {
            setFeedback({ type: "error", text: data.error || "Gagal menghapus password." });
          }
        } catch {
          setFeedback({ type: "error", text: "Terjadi kesalahan koneksi." });
        } finally {
          setLoading(false);
          setModalConfig((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleDeleteAccount = (acc: AdminAccount) => {
    setModalConfig({
      open: true,
      title: `Hapus Akun Admin "${acc.username}"?`,
      description: `Akun admin ini beserta seluruh kata sandinya akan dihapus permanen dari sistem.`,
      confirmLabel: "Ya, Hapus Akun",
      icon: Trash2,
      iconClassName: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20",
      confirmButtonClassName: "button-primary !bg-rose-600 hover:!bg-rose-500 shadow-md shadow-rose-600/20",
      action: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/accounts?id=${encodeURIComponent(acc.id)}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (data.success) {
            setFeedback({ type: "success", text: `Akun admin "${acc.username}" berhasil dihapus!` });
            fetchAccounts();
            onRefresh();
          } else {
            setFeedback({ type: "error", text: data.error || "Gagal menghapus akun." });
          }
        } catch {
          setFeedback({ type: "error", text: "Terjadi kesalahan koneksi." });
        } finally {
          setLoading(false);
          setModalConfig((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

  const buildCurrentStrategyConfig = (): PasswordStrategyConfig => {
    switch (strategyType) {
      case "STATIC":
        return { type: "STATIC", password: staticPassword };
      case "YEAR_RANGE":
        return { type: "YEAR_RANGE", base: yearBase, startYear: Number(startYear), endYear: Number(endYear) };
      case "MULTIPLE":
        return {
          type: "MULTIPLE",
          passwords: multiplePasswords.split(",").map((p) => p.trim()).filter(Boolean)
        };
      case "PREFIX":
        return { type: "PREFIX", prefix: prefixText };
      case "SUFFIX":
        return { type: "SUFFIX", suffix: suffixText };
      case "REGEX":
        return { type: "REGEX", pattern: regexPattern };
    }
  };

  const handleTestValidator = async () => {
    if (!testPasswordInput) return;
    setTestResult(null);
    const strategy = buildCurrentStrategyConfig();

    try {
      const res = await fetch("/api/admin/strategies/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputPassword: testPasswordInput, strategy })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ evaluated: true, valid: data.valid });
      } else {
        setFeedback({ type: "error", text: data.error || "Gagal menguji strategi password." });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan koneksi jaringan." });
    }
  };

  const handleSaveStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    const strategy = buildCurrentStrategyConfig();

    setModalConfig({
      open: true,
      title: `Simpan Strategi Password ${selectedResource.toUpperCase()}?`,
      description: `Aturan validasi kata sandi untuk ${selectedResource.toUpperCase()} akan diperbarui ke strategi ${strategyType}.`,
      confirmLabel: "Ya, Simpan Strategi",
      icon: KeyRound,
      iconClassName: "border-primary/30 bg-primary/10 text-primary shadow-glow shadow-primary/20",
      confirmButtonClassName: "button-primary shadow-md shadow-primary/20",
      action: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/admin/strategies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature: selectedResource, strategy })
          });
          const data = await res.json();
          if (data.success) {
            setFeedback({ type: "success", text: `Strategi password untuk ${selectedResource.toUpperCase()} berhasil disimpan.` });
            broadcastCrossTabEvent("STRATEGY_UPDATED", { feature: selectedResource });
            onRefresh();
          } else {
            setFeedback({ type: "error", text: data.error || "Gagal menyimpan strategi." });
          }
        } catch {
          setFeedback({ type: "error", text: "Terjadi kesalahan koneksi." });
        } finally {
          setLoading(false);
          setModalConfig((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Standar Top Header Card */}
      <div className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary cursor-pointer select-none"
          >
            <Settings className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Pengaturan Sistem & Kredensial</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Multi-Admin Engine
              </span>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Kelola strategi kata sandi terproteksi, daftar akun admin, dan multi-password terpusat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <div className="px-3.5 py-2 rounded-2xl border border-line bg-surface/80 flex items-center gap-2 shadow-xs">
            <User className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-muted">Akun Terdaftar:</span>
            <span className="font-display text-xs font-black text-primary">{accounts.length} Akun</span>
          </div>
        </div>
      </div>

      {/* Alert Feedback Banner */}
      {feedback ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl p-4 text-xs font-bold border shadow-xs",
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </motion.div>
      ) : null}

      {/* Section 1: Multi-Admin Accounts & Multi-Password Management Hub */}
      <div className="premium-card p-6 sm:p-7 rounded-3xl border border-line bg-surface flex flex-col gap-6 relative overflow-hidden shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-4 gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="icon-orbit grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-500">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-primary">
                Manajemen Akun Admin & Multi-Password
              </h3>
              <p className="text-xs font-bold text-muted mt-0.5">
                Satu nama pengguna dapat memiliki beberapa kata sandi alternatif aktif bersamaan.
              </p>
            </div>
          </div>

          <MagneticButton className="w-fit shrink-0">
            <motion.button
              type="button"
              onClick={() => setShowAddAccountForm(!showAddAccountForm)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black shadow-xs cursor-pointer select-none border transition-all",
                showAddAccountForm
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white"
              )}
            >
              {showAddAccountForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showAddAccountForm ? "Tutup Form" : "Tambah Akun Admin Baru"}</span>
            </motion.button>
          </MagneticButton>
        </div>

        {/* Form Tambah Akun Admin Baru (AnimatePresence expansion dengan Transisi Mulus) */}
        <AnimatePresence>
          {showAddAccountForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleCreateAccount}
              className="overflow-hidden p-5 rounded-2xl border border-blue-500/30 bg-blue-500/[0.03] flex flex-col gap-4 shadow-xs relative z-10"
            >
              <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Form Pendaftaran Akun Admin Baru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Username Admin</label>
                  <input
                    type="text"
                    required
                    value={newAccUser}
                    onChange={(e) => setNewAccUser(e.target.value)}
                    placeholder="Contoh: AdminDua"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Kata Sandi Pertama</label>
                  <input
                    type="password"
                    required
                    value={newAccPass}
                    onChange={(e) => setNewAccPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Role Akses</label>
                  <div className="relative w-full">
                    <select
                      value={newAccRole}
                      onChange={(e) => setNewAccRole(e.target.value as any)}
                      className="input-field pr-10 text-xs font-medium w-full rounded-xl appearance-none cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN (Akses Penuh)</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN (Akses Utama)</option>
                      <option value="AUDITOR">AUDITOR (Monitoring Log)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <MagneticButton className="w-fit">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 text-xs font-black shadow-md shadow-blue-600/20 cursor-pointer select-none"
                  >
                    <Check className="h-4 w-4" />
                    <span>Buat Akun Admin</span>
                  </motion.button>
                </MagneticButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Daftar Akun Admin Active */}
        <div className="flex flex-col gap-4 relative z-10">
          {accounts.map((acc) => {
            const isAddPassActive = activeAddPassAccId === acc.id;

            return (
              <motion.div
                key={acc.id}
                layout
                className="p-5 rounded-2xl border border-line bg-surface/90 flex flex-col gap-4 shadow-xs relative overflow-hidden"
              >
                {/* Header Akun */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl grid place-items-center bg-blue-500/10 border border-blue-500/20 text-blue-500 font-black text-xs shrink-0">
                      {acc.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-sm font-black text-primary truncate">{acc.username}</h4>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm shrink-0",
                          acc.role === "SUPER_ADMIN"
                            ? "bg-rose-600 text-white border-rose-500/40 shadow-rose-600/20"
                            : acc.role === "ADMIN"
                            ? "bg-blue-600 text-white border-blue-500/40 shadow-blue-600/20"
                            : "bg-amber-600 text-white border-amber-500/40 shadow-amber-600/20"
                        )}>
                          {acc.role === "SUPER_ADMIN" ? "SUPER ADMIN" : acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                        Memiliki {acc.passwords.length} Kata Sandi Aktif Terdaftar
                      </p>
                    </div>
                  </div>

                  {/* Actions Header Akun */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <MagneticButton className="flex-1 sm:flex-none">
                      <motion.button
                        type="button"
                        onClick={() => setActiveAddPassAccId(isAddPassActive ? null : acc.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "w-full px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none border",
                          isAddPassActive
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white"
                        )}
                      >
                        {isAddPassActive ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        <span>{isAddPassActive ? "Tutup Form" : "Tambah Password"}</span>
                      </motion.button>
                    </MagneticButton>

                    {accounts.length > 1 && (
                      <MagneticButton className="flex-1 sm:flex-none">
                        <motion.button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus Akun</span>
                        </motion.button>
                      </MagneticButton>
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isAddPassActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col sm:flex-row items-center gap-3"
                    >
                      <input
                        type="password"
                        value={additionalPasswordInput}
                        onChange={(e) => setAdditionalPasswordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPasswordToAccount(acc.id);
                          }
                        }}
                        placeholder="Masukkan kata sandi baru untuk username ini..."
                        className="input-field px-4 py-2 text-xs font-medium w-full rounded-xl"
                      />
                      <MagneticButton className="w-fit shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddPasswordToAccount(acc.id)}
                          className="px-4 py-2 rounded-xl border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer select-none"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>Simpan Password</span>
                        </button>
                      </MagneticButton>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Badges Daftar Kata Sandi Aktif */}
                <div>
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block mb-2">
                    Daftar Kata Sandi Terdaftar ({acc.passwords.length}):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {acc.passwords.map((pass, pIdx) => (
                      <div
                        key={pIdx}
                        className="px-3 py-1.5 rounded-xl border border-line bg-surface/80 flex items-center gap-2 text-xs font-mono font-bold text-primary shadow-xs"
                      >
                        <Key className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{pass}</span>
                        {acc.passwords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePasswordFromAccount(acc.id, pass)}
                            className="p-0.5 rounded-md hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                            title="Hapus kata sandi ini"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Universal Resource Password Policy Engine Panel */}
      <div className="premium-card p-6 sm:p-7 rounded-3xl border border-line bg-surface flex flex-col gap-6 relative overflow-hidden shadow-card">
        <div className="flex items-center justify-between border-b border-line pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="icon-orbit grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-primary">
                Universal Resource Password Policy Engine
              </h3>
              <p className="text-xs font-bold text-muted mt-0.5">
                Konfigurasi metode validasi kata sandi untuk CV, Private Vault, dan Materi ECL Deutsch B2.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
            Engine PR-006A
          </span>
        </div>

        <form onSubmit={handleSaveStrategy} className="flex flex-col gap-6 relative z-10">
          {/* Segmented Resource Pill Tabs (Tanpa Emoji) */}
          <div>
            <label className="block text-xs font-black text-primary uppercase tracking-wider mb-2.5">
              1. Pilih Fitur / Resource Target
            </label>
            <div className="p-1 rounded-2xl bg-surface/90 border border-line grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-xs">
              {[
                { key: "cv", label: "Dokumen CV (CV)" },
                { key: "vault", label: "Private Vault (Vault)" },
                { key: "ecl", label: "ECL Deutsch B2 (ECL)" }
              ].map((res) => {
                const isActive = selectedResource === res.key;
                return (
                  <button
                    key={res.key}
                    type="button"
                    onClick={() => setSelectedResource(res.key as FeatureType)}
                    className={cn(
                      "relative py-2.5 rounded-xl text-xs font-black transition-all select-none flex items-center justify-center gap-1.5 cursor-pointer",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-muted hover:text-primary hover:bg-surface"
                    )}
                  >
                    <span>{res.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Animated Accordion Selector for Password Validation Strategy */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-black text-primary uppercase tracking-wider">
              2. Pilih Strategi Validasi Password
            </label>

            {/* Accordion Trigger Header */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStrategyAccordionOpen(!strategyAccordionOpen)}
                className="w-full p-4 rounded-2xl border border-line bg-surface/80 hover:bg-surface text-left flex items-center justify-between gap-3 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/10 border border-primary/20 text-primary font-black text-xs">
                    {strategyType.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-primary">
                      {STRATEGY_OPTIONS.find((s) => s.key === strategyType)?.label}
                    </h4>
                    <p className="text-[11px] font-bold text-muted mt-0.5">
                      {STRATEGY_OPTIONS.find((s) => s.key === strategyType)?.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Ubah Strategi
                  </span>
                  <motion.div
                    animate={{ rotate: strategyAccordionOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="p-1 rounded-lg text-muted group-hover:text-primary transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </div>
              </button>

              {/* Accordion Dropdown Content dengan Animasi Meluncur Mulus */}
              <AnimatePresence>
                {strategyAccordionOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl p-2 z-30 flex flex-col gap-1 mt-1"
                  >
                    {STRATEGY_OPTIONS.map((opt) => {
                      const isSelected = strategyType === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setStrategyType(opt.key);
                            setStrategyAccordionOpen(false);
                          }}
                          className={cn(
                            "p-3 rounded-xl text-left flex items-center justify-between transition-all select-none cursor-pointer",
                            isSelected
                              ? "bg-primary/10 border border-primary/30 text-primary font-black shadow-xs"
                              : "hover:bg-surface/80 text-muted hover:text-primary"
                          )}
                        >
                          <div>
                            <span className="text-xs font-black block text-primary">{opt.label}</span>
                            <span className="text-[11px] font-bold text-muted mt-0.5 block">{opt.desc}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Configuration Input Area with Smooth Spring AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={strategyType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="soft-card p-5 rounded-2xl border border-line bg-surface/60 flex flex-col gap-3 shadow-xs"
            >
              <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                Parameter Strategi [{strategyType}]
              </h4>

              {strategyType === "STATIC" && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Static Password</label>
                  <input
                    type="text"
                    required
                    value={staticPassword}
                    onChange={(e) => setStaticPassword(e.target.value)}
                    placeholder="Contoh: cvhajat2026"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>
              )}

              {strategyType === "YEAR_RANGE" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">Base String</label>
                    <input
                      type="text"
                      required
                      value={yearBase}
                      onChange={(e) => setYearBase(e.target.value)}
                      placeholder="Contoh: 10juli"
                      className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">Start Year</label>
                    <input
                      type="number"
                      required
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">End Year</label>
                    <input
                      type="number"
                      required
                      value={endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
                      className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                    />
                  </div>
                </div>
              )}

              {strategyType === "MULTIPLE" && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Daftar Password (Dipisahkan Koma)</label>
                  <input
                    type="text"
                    required
                    value={multiplePasswords}
                    onChange={(e) => setMultiplePasswords(e.target.value)}
                    placeholder="Contoh: pass1, pass2, pass3"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>
              )}

              {strategyType === "PREFIX" && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Awalan Password (Prefix)</label>
                  <input
                    type="text"
                    required
                    value={prefixText}
                    onChange={(e) => setPrefixText(e.target.value)}
                    placeholder="Contoh: hajat"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>
              )}

              {strategyType === "SUFFIX" && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Akhiran Password (Suffix)</label>
                  <input
                    type="text"
                    required
                    value={suffixText}
                    onChange={(e) => setSuffixText(e.target.value)}
                    placeholder="Contoh: 2026"
                    className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
                  />
                </div>
              )}

              {strategyType === "REGEX" && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Pola Regular Expression (REGEX)</label>
                  <input
                    type="text"
                    required
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="Contoh: ^[a-z]+2026$"
                    className="input-field px-4 py-2.5 text-xs font-mono w-full rounded-xl"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Interactive Live Validator Tester */}
          <div className="soft-card p-5 rounded-2xl border border-line bg-surface/60 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-primary uppercase tracking-wider">
                Live Interactive Validator Tester
              </label>
              <span className="text-[10px] font-bold text-muted">Uji aturan secara instant</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={testPasswordInput}
                onChange={(e) => {
                  setTestPasswordInput(e.target.value);
                  if (testResult) setTestResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTestValidator();
                  }
                }}
                placeholder="Masukkan contoh kata sandi untuk diuji..."
                className="input-field px-4 py-2.5 text-xs font-medium w-full rounded-xl"
              />

              <MagneticButton className="shrink-0 w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={handleTestValidator}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary active:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20 px-4 py-2.5 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none shrink-0 w-full sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  <span>Uji Password</span>
                </motion.button>
              </MagneticButton>
            </div>

            <AnimatePresence mode="wait">
              {testResult ? (
                <motion.div
                  key={testResult.valid ? "valid" : "invalid"}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 450, damping: 24 }}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black w-fit border shadow-xs select-none",
                    testResult.valid
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}
                >
                  {testResult.valid ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />}
                  <span>{testResult.valid ? "VALID — Pas Masuk" : "INVALID — Ditolak Sistem"}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="pt-2 flex justify-start">
            <MagneticButton className="w-fit">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary active:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20 px-6 py-3 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Strategi Password</span>
              </motion.button>
            </MagneticButton>
          </div>
        </form>
      </div>

      {/* Confirmation Modal Standard */}
      <ConfirmModal
        open={modalConfig.open}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel || "Ya, Simpan"}
        icon={modalConfig.icon || Save}
        iconClassName={modalConfig.iconClassName}
        confirmButtonClassName={modalConfig.confirmButtonClassName}
        onConfirm={modalConfig.action}
        onCancel={() => setModalConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
