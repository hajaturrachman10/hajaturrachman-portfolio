import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminContainer = dynamic(
  () => import("@/features/admin/components/AdminContainer").then((mod) => mod.AdminContainer),
  { ssr: false }
);


export const metadata: Metadata = {
  title: "Pusat Kendali Admin — Hajaturrachman",
  description: "Ruang kendali internal terisolasi portofolio Hajaturrachman.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <AdminContainer />
    </main>
  );
}

