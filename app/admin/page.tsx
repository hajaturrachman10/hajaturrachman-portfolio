"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { AdminLoginView } from "@/features/admin/components/AdminLoginView";
import { AdminDashboardView } from "@/features/admin/components/AdminDashboardView";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("hajat_admin");

  const checkSession = useCallback(async () => {
    const startTime = Date.now();
    try {
      const res = await fetch("/api/admin/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          if (data.user) setAdminUsername(data.user);
        } else {
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1000 - elapsed);
      setTimeout(() => {
        setCheckingAuth(false);
      }, remaining);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = authenticated 
        ? "Admin Control Center | Hajaturrachman" 
        : "Admin Login | Hajaturrachman";
    }
  }, [authenticated]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Logout error handled
    } finally {
      setAuthenticated(false);
    }
  };

  if (checkingAuth) {
    const isRemembered = typeof window !== "undefined" ? localStorage.getItem("remember_session_admin") !== "false" : true;
    return (
      <div className="min-h-screen grid place-items-center px-4 py-16 bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-10 min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center text-center gap-4 max-w-md w-full border border-line bg-surface select-none shadow-2xl"
        >
          <div className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl border",
            isRemembered
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-glow shadow-emerald-500/20"
              : "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20"
          )}>
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>

          <div>
            <div className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 border",
              isRemembered
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              <span>{isRemembered ? "OTENTIKASI ADMIN" : "ENKRIPSI SESI ADMIN"}</span>
            </div>
            <h4 className={cn(
              "font-display text-sm sm:text-base font-black",
              isRemembered ? "text-emerald-500" : "text-rose-500"
            )}>
              {isRemembered ? "Memulihkan Sesi Aman..." : "Mengamankan Sesi..."}
            </h4>
          </div>

          <div className={cn(
            "w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border",
            isRemembered ? "bg-emerald-500/15 border-emerald-500/20" : "bg-rose-500/15 border-rose-500/20"
          )}>
            <motion.div
              className={cn("h-full rounded-full", isRemembered ? "bg-emerald-500" : "bg-rose-500")}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
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
