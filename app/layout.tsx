import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/data/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";


export const metadata: Metadata = {
  metadataBase: new URL("https://hajat.vercel.app"),
  alternates: {
    canonical: "https://hajat.vercel.app",
    languages: {
      "id-ID": "https://hajat.vercel.app",
      "de-DE": "https://hajat.vercel.app/?lang=de",
    },
  },
  title: `${siteConfig.name} — Personal Portofolio`,
  description:
    "Website portofolio pribadi Hajaturrachman: perjalanan, karya, Ausbildung Jerman, dan mimpi berkeliling dunia.",
  keywords: [
    "Hajaturrachman",
    "Hajat",
    "Portofolio",
    "Ausbildung",
    "Perawat",
    "Jerman",
    "ECL B2",
    "Personal Website"
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  verification: {
    google: "google-site-verification-placeholder",
  },
  openGraph: {
    title: `${siteConfig.name} — Personal Portofolio`,
    description:
      "Portofolio personal Hajaturrachman: perjalanan bahasa Jerman, pengalaman organisasi, proyek kreatif, target Ausbildung perawat di Jerman, dan mimpi berkeliling dunia.",
    type: "website",
    locale: "id_ID",
    url: "https://hajat.vercel.app",
    siteName: "Hajaturrachman Portofolio",
    images: [
      {
        url: "/assets/profile.jpg",
        width: 800,
        height: 1066,
        alt: "Hajaturrachman - Calon Ausbildung Perawat di Jerman"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Personal Portofolio`,
    description:
      "Website portofolio pribadi Hajaturrachman: perjalanan, karya, Ausbildung Jerman, dan mimpi berkeliling dunia.",
    images: ["/assets/profile.jpg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b18" }
  ]
};

import { ScrollRestoration } from "@/components/ScrollRestoration";
import { PageRestoreOverlay } from "@/components/PageRestoreOverlay";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        {/* JSON-LD Structured Data Schema for Google Search snippet optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "mainEntity": {
                "@type": "Person",
                "name": "Hajaturrachman",
                "alternateName": "Hajat",
                "jobTitle": "Future Nursing Ausbildung Candidate",
                "nationality": "ID",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Jakarta Timur",
                  "addressCountry": "ID"
                },
                "description": "Website portofolio pribadi Hajaturrachman: perjalanan, karya, Ausbildung Jerman, dan mimpi berkeliling dunia.",
                "image": "https://hajat.vercel.app/assets/profile.jpg",
                "sameAs": [
                  "https://instagram.com/saya.hajat"
                ]
              }
            })
          }}
        />
        <Providers>
          <PageRestoreOverlay />
          <ScrollRestoration />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
