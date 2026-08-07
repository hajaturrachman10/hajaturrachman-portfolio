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

export const metadata: Metadata = {
  metadataBase: new URL("https://hajat.vercel.app"),
  alternates: {
    canonical: "https://hajat.vercel.app",
    languages: {
      "id-ID": "https://hajat.vercel.app",
      "de-DE": "https://hajat.vercel.app/?lang=de",
    },
  },
  title: {
    default: `${siteConfig.name} — Personal Portofolio Resmi | Hajat ECL B2`,
    template: `%s | ${siteConfig.name}`
  },
  manifest: "/manifest.json",
  description:
    "Website portofolio pribadi Hajaturrachman: perjalanan bahasa Jerman ECL B2, Ausbildung perawat di Jerman, karya kreatif, dan proyek web.",
  keywords: [
    "Hajaturrachman",
    "Hajat",
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
    "Portofolio Perawat Jerman"
  ],
  authors: [{ name: siteConfig.name, url: "https://hajat.vercel.app" }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
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
    title: "Hajaturrachman Portfolio",
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
      { url: "/assets/icon.jpg" },
      { url: "/icon.jpg" }
    ],
    shortcut: "/assets/icon.jpg",
    apple: "/assets/icon.jpg",
  },
  openGraph: {
    title: `${siteConfig.name} — Personal Portofolio`,
    description:
      "Portofolio personal Hajaturrachman: perjalanan bahasa Jerman ECL B2, pengalaman organisasi, proyek kreatif, target Ausbildung perawat di Jerman, dan mimpi berkeliling dunia.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
        <link rel="icon" href="/assets/icon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/assets/icon.jpg" />
        <meta name="thumbnail" content="https://hajat.vercel.app/assets/profile.jpg" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://hajat.vercel.app/#person",
                "name": "Hajaturrachman",
                "alternateName": ["Hajat", "Hajaturrachman ECL B2", "Hajat Portfolio"],
                "url": "https://hajat.vercel.app",
                "image": "https://hajat.vercel.app/assets/profile.jpg",
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
                "@id": "https://hajat.vercel.app/#website",
                "url": "https://hajat.vercel.app",
                "name": "Hajaturrachman Portofolio",
                "description":
                  "Website portofolio pribadi Hajaturrachman: perjalanan bahasa Jerman ECL B2, Ausbildung perawat di Jerman, dan proyek kreatif.",
                "inLanguage": ["id-ID", "de-DE"],
                "publisher": {
                  "@id": "https://hajat.vercel.app/#person"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                "@id": "https://hajat.vercel.app/#webpage",
                "url": "https://hajat.vercel.app",
                "name": "Hajaturrachman — Personal Portofolio",
                "mainEntity": {
                  "@id": "https://hajat.vercel.app/#person"
                }
              }
            ])
          }}
        />
        {/* Hidden Semantic SEO Anchor Block for Search Engine Crawlers */}
        <div className="sr-only">
          <h1>Hajaturrachman — Personal Portofolio Resmi | Hajat ECL B2</h1>
          <h2>Website Resmi Hajaturrachman: Perjalanan Bahasa Jerman ECL B2, Ausbildung Perawat di Jerman, & Karya Kreatif</h2>
          <p>
            Selamat datang di website portofolio pribadi resmi Hajaturrachman (Hajat).
            Menampilkan rekam jejak sertifikat ECL Deutsch B2, persiapan Ausbildung perawat di Jerman,
            proyek web development, galeri video karya, dan informasi kontak resmi.
          </p>
        </div>

        <Providers>
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
