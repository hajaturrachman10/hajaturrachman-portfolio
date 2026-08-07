import type { Metadata } from "next";
import { NotFoundView } from "@/components/views/NotFoundView";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan — Hajaturrachman",
  description: "Alamat URL yang Anda tuju mungkin salah, telah dipindahkan, atau telah diperbarui dalam arsitektur portofolio v2.3.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundView />;
}
