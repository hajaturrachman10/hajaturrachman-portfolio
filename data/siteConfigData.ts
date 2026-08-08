import {
  BadgeCheck, Compass, FileText, Film, Globe2, Home, HeartHandshake, Image as ImageIcon, Languages, LockKeyhole, MapPinned, PenTool, Plane, Stethoscope, Trophy, UsersRound
} from "lucide-react";

export const sharedConfig = {
  name: "Hajaturrachman",
  preferredName: "Hajaturrachman",
  shortName: "Hajat",
  siteUrl: (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) || "https://hajat.vercel.app",
  role: "Future Nursing Ausbildung Candidate",
  email: "Hajaturrachman2006@gmail.com",
  phone: "0851-5851-8090",
  instagram: "@saya.hajat",
  profileImage: "/assets/profile.jpg",
  cvUrl: "/docs/Hajaturrachman-CV.pdf",
  socials: [
    { label: "Instagram", value: "@saya.hajat", href: "https://instagram.com/saya.hajat" },
    { label: "Email", value: "Hajaturrachman2006@gmail.com", href: "mailto:Hajaturrachman2006@gmail.com" },
    { label: "GitHub", value: "Belum diisi", href: "#" },
    { label: "LinkedIn", value: "Belum diisi", href: "#" }
  ]
};

export const indonesianSiteConfig = {
  ...sharedConfig,
  headline: "Kandidat Ausbildung Keperawatan di Jerman | Penggiat Literasi & Komunikasi",
  location: "Jakarta Timur, Indonesia",
  origin: "Cirebon, Indonesia",
  bio: "Saya adalah Hajaturrachman, seorang komunikator yang adaptif dan berdedikasi, kini sedang mempersiapkan langkah menuju program Ausbildung Keperawatan di Jerman. Website ini dirancang sebagai ruang portofolio profesional, dokumentasi perjalanan belajar bahasa, dokumentasi proyek kreatif, serta proses pengembangan diri saya secara mandiri.",
  longBio: "Perjalanan saya dimulai dari Cirebon dan kini berlanjut di Jakarta Timur untuk mengikuti persiapan intensif bahasa Jerman. Dengan target sertifikasi ECL Deutsch B2, saya membangun disiplin belajar yang kuat serta mengintegrasikan pengalaman di bidang organisasi, literasi, riset sosial, dan produksi film pendek. Portofolio ini merangkum komitmen saya dalam belajar, berkarya, serta merintis karier keperawatan profesional secara mandiri.",
  focus: [
    "Lulus ECL Deutsch B2 Agustus 2026",
    "Mendapatkan jalur Ausbildung keperawatan di Jerman",
    "Membangun karier jangka panjang di Jerman",
    "Mendokumentasikan perjalanan belajar, karya, dan hidup",
    "Suatu hari berkeliling dunia dan melihat banyak budaya secara langsung"
  ],
  navItems: [
    { label: "Beranda", href: "/" },
    { label: "Cerita", href: "/journey" },
    { label: "Proyek", href: "/projects" },
    { label: "Galeri", href: "/gallery" },
    { label: "Privat", href: "/private" },
    { label: "Materi", href: "/ecl-b2" },
    { label: "Kontak", href: "/#contact" }
  ],
  stats: [
    { value: "B1", label: "Sertifikasi ECL", icon: BadgeCheck },
    { value: "B2", label: "Target 2026", icon: Languages },
    { value: "8+", label: "Dokumen Prestasi", icon: Trophy },
    { value: "Dunia", label: "Tujuan Impian", icon: Globe2 }
  ]
};

export const germanSiteConfig = {
  ...sharedConfig,
  headline: "Ausbildungskandidat für Krankenpflege in Deutschland | Alphabetisierungs- & Kommunikationsaktivist",
  location: "Ost-Jakarta, Indonesien",
  origin: "Cirebon, Indonesien",
  bio: "Ich bin Hajaturrachman, ein anpassungsfähiger und engagierter Kommunikator, der sich derzeit auf die Pflege-Ausbildung in Deutschland vorbereitet. Diese Website dient als professionelles Portfolio, Dokumentation meiner Lernreise, kreativer Projekte sowie meiner persönlichen Weiterentwicklung.",
  longBio: "Meine Reise begann in Cirebon und führt mich nun nach Ost-Jakarta, wo ich an einer intensiven Deutschvorbereitung teilnehme. Mit dem Ziel des ECL Deutsch B2-Zertifikats baue ich eine starke Lerndisziplin auf und kombiniere meine Erfahrungen in den Bereichen Organisation, Alphabetisierung, Sozialforschung und Kurzfilmproduktion. Dieses Portfolio spiegelt mein Engagement für kontinuierliches Lernen, Kreativität und den Aufbau einer professionellen Pflegekarriere wider.",
  focus: [
    "ECL Deutsch B2 bestehen im August 2026",
    "Einen Ausbildungsplatz für Krankenpflege in Deutschland sichern",
    "Aufbau einer langfristigen Karriere in Deutschland",
    "Dokumentation von Lernreisen, Arbeiten und Lebenserfahrungen",
    "Eines Tages um die Welt reisen und viele Kulturen hautnah erleben"
  ],
  navItems: [
    { label: "Startseite", href: "/" },
    { label: "Geschichte", href: "/journey" },
    { label: "Projekte", href: "/projects" },
    { label: "Galerie", href: "/gallery" },
    { label: "Privat", href: "/private" },
    { label: "Unterlagen", href: "/ecl-b2" },
    { label: "Kontakt", href: "/#contact" }
  ],
  stats: [
    { value: "B1", label: "ECL Zertifikat", icon: BadgeCheck },
    { value: "B2", label: "Ziel 2026", icon: Languages },
    { value: "8+", label: "Nachweise", icon: Trophy },
    { value: "Welt", label: "Traumziel", icon: Globe2 }
  ]
};

export const indonesianJourneyCards = [
  { title: "Dari Cirebon ke Jakarta Timur", icon: MapPinned, text: "Saya membawa cerita dari Cirebon, lalu belajar membangun langkah yang lebih serius di Jakarta Timur untuk persiapan bahasa Jerman dan masa depan." },
  { title: "Jerman sebagai Arah Karier", icon: Stethoscope, text: "Saya menyiapkan diri untuk Ausbildung perawat di Jerman, bukan hanya sebagai tujuan kerja, tetapi sebagai proses membangun hidup yang lebih mandiri." },
  { title: "Bahasa sebagai Pintu", icon: Languages, text: "Bahasa Jerman menjadi pintu penting. Dari A1, B1, sampai target B2, prosesnya membentuk disiplin, mental, dan cara belajar saya." },
  { title: "Mimpi Keliling Dunia", icon: Plane, text: "Salah satu mimpi besar saya adalah berkeliling dunia setidaknya sekali dalam hidup, melihat budaya lain, dan membawa cerita pulang." }
];

export const germanJourneyCards = [
  { title: "Von Cirebon nach Ost-Jakarta", icon: MapPinned, text: "Ich bringe Erfahrungen aus Cirebon mit und gehe in Ost-Jakarta ernsthafte Schritte zur Vorbereitung auf die deutsche Sprache und meine Zukunft." },
  { title: "Deutschland als Karriereziel", icon: Stethoscope, text: "Ich bereite mich auf die Ausbildung zur Pflegefachkraft in Deutschland vor, nicht nur als Job, sondern als Schritt in ein unabhängiges Leben." },
  { title: "Die Sprache als Schlüssel", icon: Languages, text: "Die deutsche Sprache ist der Schlüssel. Der Prozess von A1 über B1 bis zum Ziel B2 prägt meine Disziplin und Lernmethode." },
  { title: "Traum von der Weltreise", icon: Plane, text: "Einer meiner großen Träume ist es, mindestens einmal im Leben die Welt zu bereisen, andere Kulturen kennenzulernen und neue Geschichten mitzubringen." }
];

export const indonesianCvAccess = { title: "Akses Curriculum Vitae Hajat", description: "Curriculum Vitae (CV) dapat diakses langsung secara interaktif melalui website ini setelah memasukkan kode akses. Pilihan untuk mengunduh dokumen PDF juga tersedia secara gratis setelah akses dibuka.", icon: FileText };
export const germanCvAccess = { title: "Curriculum Vitae Zugang", description: "Der Lebenslauf (CV) kann direkt interaktiv auf dieser Website eingesehen werden, nachdem der Zugangscode eingegeben wurde. Die Option zum Herunterladen des PDF-Dokuments steht nach der Freischaltung kostenlos zur Verfügung.", icon: FileText };

export const indonesianValueCards = [
  { title: "Disiplin Belajar", description: "Saya berkomitmen tinggi pada proses belajar bertahap, khususnya dalam persiapan bahasa Jerman ECL B2.", icon: PenTool },
  { title: "Orientasi Pelayanan", description: "Karier keperawatan menuntut empati mendalam, ketahanan fisik-mental, dan rasa tanggung jawab sosial yang tinggi.", icon: Stethoscope },
  { title: "Kolaborasi Tim", description: "Pengalaman riset ilmiah, perfilman sekolah, dan duta baca memperkuat kemampuan koordinasi lintas tim saya.", icon: Compass },
  { title: "Mobilitas Karir Global", description: "Saya sedang mempersiapkan integrasi kehidupan dan pengembangan karir jangka panjang di Jerman melalui jalur Ausbildung.", icon: Compass }
];

export const germanValueCards = [
  { title: "Disziplinierte Ausbildung", description: "Ich verpflichte mich zu einem strukturierten Lernprozess, insbesondere für die ECL B2 Deutschprüfung.", icon: PenTool },
  { title: "Krankenpflege-Fokus", description: "Krankenpflege erfordert tiefes Mitgefühl, physische und mentale Stärke sowie eine hohe soziale Verantwortung.", icon: Stethoscope },
  { title: "Zusammenarbeit", description: "Erfahrungen in der Forschung, der Kurzfilmproduktion und der Leseförderung stärken meine Kooperationsfähigkeit.", icon: Compass },
  { title: "Globale Karriere", description: "Ich bereite mich intensiv auf die langfristige Integration und Karriereentwicklung in Deutschland über eine Ausbildung vor.", icon: Compass }
];

export const indonesianPrivateVaultData = {
  title: "Ruang Personal",
  description: "Bagian ini dilindungi secara aman di server. Di sini tersimpan ruang kenangan foto dan cerita keluarga, sahabat, teman dekat, dan pacar.",
  icon: LockKeyhole,
  sections: [
    { id: "family", title: "Keluarga", icon: Home, summary: "Keluarga adalah fondasi besar dalam perjalanan ini. Mereka menjadi alasan kenapa perjuangan ke Jerman terasa punya makna." },
    { id: "sahabat", title: "Sahabat", icon: UsersRound, summary: "Sahabat dari berbagai fase hidup menjadi bagian penting dari cerita yang membentuk karakter." },
    { id: "close-friends", title: "Teman Dekat", icon: HeartHandshake, summary: "Teman dekat dari fase belajar dan persiapan ujian menjadi bagian penting dalam perjalanan akademik." },
    { id: "relationship", title: "Pacar", icon: HeartHandshake, summary: "Hubungan personal yang suportif dan saling menjaga untuk mendukung impian masa depan masing-masing." }
  ]
};

export const germanPrivateVaultData = {
  title: "Persönlicher Bereich",
  description: "Dieser Bereich ist auf dem Server sicher geschützt. Hier werden Fotos und Erinnerungen für Familie, Freunde, engste Bekannte und Partner aufbewahrt.",
  icon: LockKeyhole,
  sections: [
    { id: "family", title: "Familie", icon: Home, summary: "Die Familie ist das Fundament dieser Reise. Sie gibt meinem Weg nach Deutschland einen tiefen Sinn." },
    { id: "sahabat", title: "Engste Freunde", icon: UsersRound, summary: "Freunde aus verschiedenen Lebensphasen prägen meinen Charakter und meine Geschichte." },
    { id: "close-friends", title: "Gute Bekannte", icon: HeartHandshake, summary: "Gute Bekannte aus der Lernphase und Prüfungsvorbereitung sind wichtige Begleiter." },
    { id: "relationship", title: "Partner / Partnerin", icon: HeartHandshake, summary: "Eine unterstützende und wertschätzende persönliche Beziehung zur gegenseitigen Förderung von Zukunftsträumen." }
  ]
};

export const indonesianFeatureHighlights = [
  { title: "Peninjau CV", text: "CV dapat dibaca secara interaktif, serta di-download jika diperlukan.", icon: FileText },
  { title: "Cerita Proyek", text: "Setiap proyek menyajikan proses, dokumentasi, dan tautan berkas resmi.", icon: Film },
  { title: "Peta Perjalanan", text: "Merangkum mimpi, riwayat karir, pencapaian akademik, dan fokus hidup.", icon: Globe2 },
  { title: "Galeri Visual", text: "Arsip visual interaktif untuk mendokumentasikan setiap momen penting.", icon: ImageIcon }
];

export const germanFeatureHighlights = [
  { title: "CV Viewer", text: "Der Lebenslauf kann direkt online gelesen und bei Bedarf heruntergeladen werden.", icon: FileText },
  { title: "Projektgeschichten", text: "Jedes Projekt zeigt Abläufe, Dokumentationen und offizielle Links.", icon: Film },
  { title: "Reiseroute", text: "Zusammenfassung meiner Träume, Bildung, Leistungen und Fokusbereiche.", icon: Globe2 },
  { title: "Visuelle Galerie", text: "Ein interaktives Archiv zur Dokumentation wichtiger Lebensabschnitte.", icon: ImageIcon }
];
