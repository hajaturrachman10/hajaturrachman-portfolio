"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AdminLoginView } from "@/features/admin/components/AdminLoginView";
import { AdminDashboardView } from "@/features/admin/components/AdminDashboardView";
import { cn } from "@/lib/utils";

export function AdminContainer() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("hajat_admin");
  const [isRememberedSession, setIsRememberedSession] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          if (data.user) setAdminUsername(data.user);

          const isRemembered = typeof window !== "undefined" ? localStorage.getItem("remember_session_admin") !== "false" : true;
          setIsRememberedSession(isRemembered);

          if (isRemembered) {
            // REMEMBER SESSION ACTIVE: Show smooth Emerald Pemulihan Sesi overlay before unlocking
            setAuthenticated(true);
            await new Promise((r) => setTimeout(r, 1000));
            setCheckingAuth(false);
          } else {
            // REMEMBER SESSION INACTIVE: Show smooth Rose Penutupan Sesi overlay & auto-logout
            setAuthenticated(true);
            await new Promise((r) => setTimeout(r, 1000));
            try {
              await fetch("/api/admin/auth/logout", { method: "POST" });
            } catch {
              // Ignore
            }
            if (typeof window !== "undefined") {
              localStorage.removeItem("admin_active_tab");
            }
            setAuthenticated(false);
            setCheckingAuth(false);
          }
          return;
        }
      }
      // If unauthenticated (locked state) — immediately render LoginView without restoration overlay
      setAuthenticated(false);
      setCheckingAuth(false);
    } catch {
      setAuthenticated(false);
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (typeof document !== "undefined" && checkingAuth) {
      document.title = "Memuat Otentikasi Admin... | Hajaturrachman";
    }
  }, [checkingAuth]);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_active_tab");
      }
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Logout error handled
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_active_tab");
      }
      setAuthenticated(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="container-page pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none shadow-card"
        >
          <div className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl border shadow-glow",
            isRememberedSession
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20"
              : "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-rose-500/20"
          )}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
              className="inline-flex shrink-0"
            >
              <Loader2 className="h-6 w-6" />
            </motion.div>
          </div>

          <div>
            <div className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 border",
              isRememberedSession
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              <span>{isRememberedSession ? "PEMULIHAN SESI ADMIN" : "PENUTUPAN SESI ADMIN"}</span>
            </div>
            <h4 className={cn(
              "font-display text-sm sm:text-base font-black",
              isRememberedSession ? "text-emerald-500" : "text-rose-500"
            )}>
              {isRememberedSession ? "Memulihkan Sesi Admin Aktif..." : "Mengakhiri Sesi & Menghapus Token..."}
            </h4>
          </div>

          <div className={cn(
            "w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border",
            isRememberedSession ? "bg-emerald-500/15 border-emerald-500/20" : "bg-rose-500/15 border-rose-500/20"
          )}>
            <motion.div
              className={cn("h-full rounded-full", isRememberedSession ? "bg-emerald-500" : "bg-rose-500")}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLoginView onLoginSuccess={checkSession} />;
  }

  return (
    <AdminDashboardView
      adminUsername={adminUsername}
      onLogout={handleLogout}
    />
  );
}
