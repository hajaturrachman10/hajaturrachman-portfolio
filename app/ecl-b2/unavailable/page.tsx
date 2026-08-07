import type { Metadata } from "next";
import { UnavailableCard } from "@/features/ecl";

export const metadata: Metadata = {
  title: "Dokumen Belum Tersedia — Hajaturrachman",
  description: "Dokumen materi latihan ECL Deutsch B2 ini saat ini belum dipublikasikan atau sedang diperbarui.",
  robots: {
    index: false,
    follow: false,
  },
};

const DOC_NAMES: Record<string, { id: string; de: string }> = {
  "1": {
    id: "Dokumen 1 — Kumpulan Contoh Soal Ujian ECL B2",
    de: "Dokument 1 — ECL B2 Beispielaufgaben Sammlung"
  },
  "2": {
    id: "Dokumen 2 — Bocoran Membaca, Menulis & Mendengar B2",
    de: "Dokument 2 — B2 Lesen, Schreiben & Hören Vorbereitung"
  },
  "3": {
    id: "Dokumen 3 — Wahyu Ilahi ECL B2 Agustus 2026",
    de: "Dokument 3 — Wahyu Ilahi ECL B2 August 2026"
  }
};

export default function DocumentUnavailablePage({
  searchParams
}: {
  searchParams: { doc?: string };
}) {
  const docId = searchParams.doc || "1";
  const docObj = DOC_NAMES[docId] || {
    id: "Dokumen ECL Deutsch B2",
    de: "ECL Deutsch B2 Dokument"
  };

  return (
    <main className="pt-28 sm:pt-[7rem] pb-16 min-h-[calc(100vh-140px)] flex flex-col justify-center">
      <UnavailableCard docId={docId} docNames={docObj} />
    </main>
  );
}
