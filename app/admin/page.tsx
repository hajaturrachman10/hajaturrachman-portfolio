import type { Metadata } from "next";
import { AdminContainer } from "@/features/admin";

export const metadata: Metadata = {
  title: "Pusat Kendali Admin — Hajaturrachman",
  description: "Ruang kendali internal terisolasi portofolio Hajaturrachman.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminContainer />;
}
