import type { Metadata } from "next";
import { PrivateVaultSection } from "@/features/vault";

export const metadata: Metadata = {
  title: "Ruang Personal Terproteksi — Hajaturrachman",
  description: "Ruang kenangan terenkripsi yang berisi cerita dan arsip foto intim khusus untuk keluarga, sahabat, teman dekat, dan pacar.",
  keywords: ["Ruang Personal Hajat", "Vault Terproteksi Hajat", "Kenangan Terenkripsi Hajat"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivatePage() {
  return (
    <main id="main-content" tabIndex={-1} className="pt-28 sm:pt-[7.5rem] pb-16 outline-none">

      <PrivateVaultSection />
    </main>
  );
}
