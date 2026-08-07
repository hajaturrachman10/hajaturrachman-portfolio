"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

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
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="premium-card mx-auto max-w-md w-full rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold sm:text-2xl">Terjadi Kesalahan</h2>
          <p className="text-sm text-muted leading-relaxed sm:text-base">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba muat ulang halaman ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="btn-primary flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="btn-ghost flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-line"
          >
            <Home className="h-4 w-4" />
            Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
