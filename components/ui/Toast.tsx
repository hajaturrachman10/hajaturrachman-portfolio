"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Share2, Globe, Moon, Sun } from "lucide-react";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ToastType =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "purple"
  | "cyan"
  | "indigo"
  | "amber";

export type ToastMessage = {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_EVENT = "hajat_custom_toast_event";

export function toast(data: Omit<ToastMessage, "id">) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: data }));
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toastData: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type: "info", duration: 3000, ...toastData };
    
    setToasts((prev) => {
      const updated = [...prev, newToast];
      if (updated.length > 2) {
        return updated.slice(updated.length - 2);
      }
      return updated;
    });
  }, []);


  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handleCustomToast(event: Event) {
      const customEvent = event as CustomEvent<Omit<ToastMessage, "id">>;
      if (customEvent.detail) {
        addToast(customEvent.detail);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener(TOAST_EVENT, handleCustomToast);
      return () => {
        window.removeEventListener(TOAST_EVENT, handleCustomToast);
      };
    }
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Floating Toast Notification Container aligned with container-page / Navbar bounds */}
      <div className="fixed inset-x-0 bottom-6 z-[200] pointer-events-none select-none">
        <div className="container-page flex justify-end">
          <div className="flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
              {toasts.map((item) => (
                <SingleToast key={item.id} item={item} removeToast={removeToast} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: toast };
  }
  return context;
}

function SingleToast({ item, removeToast }: { item: ToastMessage; removeToast: (id: string) => void }) {
  const { id, title, message, type = "info", duration = 3000 } = item;

  // Rock-solid independent timer: stable dependencies ensure this timer NEVER gets reset when new toasts arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    purple: <Share2 className="h-5 w-5 text-purple-500 shrink-0" />,
    cyan: <Globe className="h-5 w-5 text-cyan-500 shrink-0" />,
    indigo: <Moon className="h-5 w-5 text-indigo-400 shrink-0" />,
    amber: <Sun className="h-5 w-5 text-amber-500 shrink-0" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-emerald-500/40 bg-surface/95 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10",
    info: "border-sky-500/40 bg-surface/95 text-sky-950 dark:text-sky-100 shadow-sky-500/10",
    warning: "border-amber-500/40 bg-surface/95 text-amber-950 dark:text-amber-100 shadow-amber-500/10",
    error: "border-rose-500/40 bg-surface/95 text-rose-950 dark:text-rose-100 shadow-rose-500/10",
    purple: "border-purple-500/40 bg-surface/95 text-purple-950 dark:text-purple-100 shadow-purple-500/10",
    cyan: "border-cyan-500/40 bg-surface/95 text-cyan-950 dark:text-cyan-100 shadow-cyan-500/10",
    indigo: "border-indigo-500/40 bg-surface/95 text-indigo-950 dark:text-indigo-100 shadow-indigo-500/10",
    amber: "border-amber-500/40 bg-surface/95 text-amber-950 dark:text-amber-100 shadow-amber-500/10",
  };

  const progressBg: Record<ToastType, string> = {
    success: "bg-emerald-500",
    info: "bg-sky-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  };

  return (
    <motion.div
      role="status"
      aria-live="polite"
      layout
      initial={{ opacity: 0, y: 16, x: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 36, scale: 0.92, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl p-4 shadow-2xl transform-gpu will-change-[transform,opacity] ${borderColors[type]}`}
    >

      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 min-w-0 pr-2">
          {title ? <h5 className="font-display text-xs font-black uppercase tracking-wider mb-0.5">{title}</h5> : null}
          <p className="text-xs font-bold leading-5 text-text">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => removeToast(id)}
          className="rounded-lg p-1 text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Animated Timer Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full ${progressBg[type]}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
