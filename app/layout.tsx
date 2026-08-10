import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { siteConfig } from "@/data/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollRestoration } from "@/components/providers/ScrollRestoration";
import { PageRestoreOverlay } from "@/components/providers/PageRestoreOverlay";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const currentSiteUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) || "https://hajat.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(currentSiteUrl),
  alternates: {
    canonical: currentSiteUrl,
    languages: {
      "id-ID": currentSiteUrl,
      "de-DE": `${currentSiteUrl}/?lang=de`,
    },
  },
  title: {
    default: `${siteConfig.name} — Personal Portofolio Resmi | Hajat ECL B2`,
    template: `%s | ${siteConfig.name}`
  },
  manifest: "/site.webmanifest",
  description:
    "Website portofolio pribadi Hajaturrachman: perjalanan bahasa Jerman ECL B2, Ausbildung perawat di Jerman, karya kreatif, dan proyek web.",
  keywords: [
    "Hajaturrachman",
    "Hajat",
    "Hajatur",
    "Hajatur Rachman",
    "Hajaturrahman",
    "Hajat ECL",
    "Hajat ECL B2",
    "Hajaturrachman ECL B2",
    "Hajaturrachman Portofolio",
    "Portofolio Hajaturrachman",
    "Ausbildung Perawat Jerman",
    "Bahasa Jerman ECL B2",
    "CV Hajaturrachman",
    "Hajat Nurse Ausbildung",
    "Krankenpflege Ausbildung Germany",
    "Ausbildung Pflegefachmann Deutschland",
    "Hajaturrachman Resume",
    "Portofolio Perawat Jerman",
    "Hajat Cirebon Jakarta"
  ],
  authors: [{ name: siteConfig.name, url: currentSiteUrl }],
  creator: siteConfig.name,
  publisher: `${siteConfig.name} Official Portfolio`,
  category: "Personal Portfolio",
  classification: "Portfolio & Resume",
  applicationName: "Hajaturrachman Portfolio",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "Hajaturrachman",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    google: "googled2a36b14141fb43d",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ],
  },
  openGraph: {
    title: `${siteConfig.name} — Personal Portofolio Resmi`,
    description:
      "Portofolio personal Hajaturrachman: perjalanan bahasa Jerman ECL B2, pengalaman organisasi, proyek kreatif, target Ausbildung perawat di Jerman, dan mimpi berkeliling dunia.",
    type: "website",
    locale: "id_ID",
    url: currentSiteUrl,
    siteName: "Hajaturrachman Portofolio",
    images: [
      {
        url: `${currentSiteUrl}/assets/profile.jpg`,
        width: 800,
        height: 1066,
        alt: "Hajaturrachman - Calon Ausbildung Perawat di Jerman"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Personal Portofolio Resmi`,
    description:
      "Website portofolio pribadi Hajaturrachman: perjalanan, karya, Ausbildung Jerman, dan mimpi berkeliling dunia.",
    images: [`${currentSiteUrl}/assets/profile.jpg`]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b18" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://wixqhbechyvfvwsklfak.supabase.co" />
        <link rel="dns-prefetch" href="https://wixqhbechyvfvwsklfak.supabase.co" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />

        <link rel="icon" href="/favicon.ico" sizes="any" />

        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="thumbnail" content={`${currentSiteUrl}/assets/profile.jpg`} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": `${currentSiteUrl}/#person`,
                "name": "Hajaturrachman",
                "alternateName": ["Hajat", "Hajatur", "Hajatur Rachman", "Hajaturrahman", "Hajaturrachman ECL B2", "Hajat Portfolio"],
                "url": currentSiteUrl,
                "image": `${currentSiteUrl}/assets/profile.jpg`,
                "jobTitle": "Calon Peserta Ausbildung Perawat di Jerman",
                "nationality": "ID",
                "knowsLanguage": [
                  {
                    "@type": "Language",
                    "name": "Indonesian",
                    "alternateName": "id"
                  },
                  {
                    "@type": "Language",
                    "name": "German",
                    "alternateName": "de"
                  }
                ],
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Jakarta Timur",
                  "addressCountry": "ID"
                },
                "sameAs": ["https://instagram.com/saya.hajat"],
                "hasCredential": [
                  {
                    "@type": "EducationalOccupationalCredential",
                    "credentialCategory": "certificate",
                    "name": "Sertifikat Bahasa Jerman ECL Deutsch B2",
                    "recognizedBy": {
                      "@type": "Organization",
                      "name": "ECL European Language Competence"
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${currentSiteUrl}/#website`,
                "url": currentSiteUrl,
                "name": "Hajaturrachman",
                "alternateName": ["Hajaturrachman", "Hajaturrachman Portofolio", "Hajat", "Hajatur"],
                "description":
                  "Website portofolio pribadi Hajaturrachman: perjalanan bahasa Jerman ECL B2, Ausbildung perawat di Jerman, dan proyek kreatif.",
                "inLanguage": ["id-ID", "de-DE"],
                "publisher": {
                  "@id": `${currentSiteUrl}/#person`
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                "@id": `${currentSiteUrl}/#webpage`,
                "url": currentSiteUrl,
                "name": "Hajaturrachman — Personal Portofolio Resmi",
                "mainEntity": {
                  "@id": `${currentSiteUrl}/#person`
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Siapa Hajaturrachman?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Hajaturrachman adalah seorang kandidat program Ausbildung Keperawatan di Jerman, penggiat literasi, mantan Duta Baca Kabupaten Cirebon, dan pengembang proyek-proyek kreatif."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apa target kualifikasi bahasa Jerman Hajaturrachman?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Hajaturrachman sedang menargetkan kelulusan sertifikasi bahasa Jerman tingkat ECL Deutsch B2 pada Agustus 2026 sebagai syarat utama keberangkatan Ausbildung keperawatan."
                    }
                  }
                ]
              }
            ])
          }}
        />

        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:font-black focus:rounded-2xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/50"
          >
            Lompat ke konten utama
          </a>
          <ScrollProgress />
          <ScrollRestoration />
          <PageRestoreOverlay />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </Providers>

      </body>
    </html>
  );
}
