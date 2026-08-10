"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="bg-[#070b18] text-[#f7f8ff] antialiased min-h-screen grid place-items-center p-4">
        <main className="flex min-h-[60vh] flex-col items-center justify-center text-center w-full max-w-md">
          <div className="premium-card mx-auto w-full rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-6 border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-2xl">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold sm:text-2xl font-display">Kesalahan Sistem Utama</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Maaf, terjadi kesalahan tak terduga pada aplikasi. Silakan coba muat ulang halaman.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 px-5 py-3 text-xs font-bold text-white transition-all cursor-pointer border-0 shadow-lg shadow-primary/20"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Coba Lagi</span>
              </button>
              <a
                href="/"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>Beranda</span>
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
