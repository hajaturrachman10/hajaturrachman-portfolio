export type ProjectCategory = "Film" | "Riset" | "Literasi" | "Organisasi";
export type ProjectLink = { label: string; href: string };
export type ProjectDocument = { title: string; href: string };

export type PortofolioProject = {
  title: string;
  category: ProjectCategory;
  description: string;
  impact: string;
  tech: string[];
  image: string;
  demoLinks?: ProjectLink[];
  documents?: ProjectDocument[];
  gallery: string[];
  detail: {
    role: string;
    year: string;
    overview: string;
    story: string;
    process: string[];
    learnings: string[];
    nextStep: string;
  };
};

const gallery = (key: string) =>
  Array.from({ length: 8 }, (_, index) => `/assets/gallery/collections/${key}/${key}-${index + 1}.svg`);

export const indonesianProjects: PortofolioProject[] = [
  {
    title: "Manuskrip",
    category: "Film",
    description: "Film pendek produksi OZONE ENTERTAINMENT yang melatih penyutradaraan, editing, dan manajemen kreatif tim.",
    impact: "Mengembangkan keterampilan storytelling visual, penyutradaraan, dan proses produksi.",
    tech: ["Penyutradaraan", "Editing Film", "CapCut", "Storytelling"],
    image: "/assets/project-manuskrip.svg",
    demoLinks: [{ label: "Nonton Film", href: "https://youtu.be/nKtWz8FE1to?si=O_jql3oG3xq3VXni" }],
    gallery: gallery("manuskrip"),
    detail: {
      role: "Sutradara dan Editor",
      year: "2023",
      overview: "Manuskrip adalah proyek film pendek sekolah yang memadukan ide cerita, penataan visual, pengarahan karakter, serta editing pasca-produksi.",
      story: "Proyek ini membuktikan bahwa sebuah ide kreatif harus didukung koordinasi tim yang rapi, ketelitian visual, dan ritme editing yang baik agar pesan cerita tersampaikan.",
      process: ["Menyusun naskah dan konsep visual film.", "Mengarahkan proses pengambilan gambar di lokasi.", "Menyunting video (editing) dan menata audio pendukung."],
      learnings: ["Mengambil keputusan estetika dan teknis secara cepat.", "Mengelola alur kerja tim kreatif secara kolaboratif.", "Memahami struktur storytelling yang dinamis."],
      nextStep: "Detail proyek ini mencakup credit pemain, foto behind-the-scenes, poster film resmi, dan dokumentasi produksi."
    }
  },
  {
    title: "Mawar Merah di Bawah Langit Biru",
    category: "Film",
    description: "Film pendek sekolah (2024) yang melatih teknik sinematografi, manajemen produksi, dan alur kolaborasi tim.",
    impact: "Membentuk kedisiplinan pra-produksi hingga pasca-produksi di bidang perfilman.",
    tech: ["Sinematografi", "Manajemen Produksi", "Editing Video", "Storytelling"],
    image: "/assets/project-mawar.svg",
    demoLinks: [
      { label: "Trailer Resmi", href: "https://youtu.be/dTxlNTla91Q?si=HDZUIED_hqNuyAzk" },
      { label: "Nonton Film", href: "https://youtu.be/35d63Y0m80M?si=v7_39SxPJdVZymBh" }
    ],
    gallery: gallery("mawar"),
    detail: {
      role: "Tim Produksi Kreatif",
      year: "2024",
      overview: "Mawar Merah di Bawah Langit Biru merupakan film pendek yang menguji kemampuan koordinasi produksi dan kepekaan visual tim secara terstruktur.",
      story: "Melalui film ini, saya belajar menyelaraskan banyak kepala, menerjemahkan pesan emosional ke dalam bahasa kamera, serta menjaga efisiensi jadwal syuting.",
      process: ["Membantu perumusan alur cerita dan kebutuhan properti.", "Mengoordinasikan jadwal produksi antar divisi.", "Membantu editing visual akhir film."],
      learnings: ["Mengelola manajemen waktu yang ketat saat syuting.", "Menyampaikan pesan emosional melalui bahasa visual.", "Bekerja di bawah kepemimpinan sutradara."],
      nextStep: "Detail proyek ini mencakup galeri foto proses syuting, poster promosi, daftar kru, dan credit lengkap."
    }
  },
  {
    title: "Proposal Riset Sosial-Humaniora",
    category: "Riset",
    description: "Dua proposal penelitian ilmiah mengenai pemertahanan bahasa nasional di ruang publik dan pengaruh orang tua pekerja migran terhadap perilaku anak.",
    impact: "Mengasah kemampuan berpikir kritis, analisis data sosial, dan penulisan karya ilmiah terstruktur.",
    tech: ["Proposal Riset", "Metodologi Sosial", "Penulisan Ilmiah", "Analisis Data"],
    image: "/assets/project-riset.svg",
    documents: [
      { title: "Proposal Pemertahanan Bahasa Nasional", href: "/assets/docs/proposal-bahasa-nasional.pdf" },
      { title: "Proposal Orang Tua Pekerja Migran", href: "/assets/docs/riset-pekerja-migran.pdf" }
    ],
    gallery: gallery("riset"),
    detail: {
      role: "Peneliti Utama / Tim KIR",
      year: "2023 - 2024",
      overview: "Dua riset sosial-humaniora ini dirancang untuk menjawab fenomena sosial di sekitar melalui metode penelitian ilmiah yang teruji.",
      story: "Riset mengajarkan saya bahwa masalah sosial tidak cukup diasumsikan, melainkan harus diuji menggunakan data, landasan teori yang kuat, dan metodologi yang objektif.",
      process: ["Mengidentifikasi masalah dan menyusun latar belakang.", "Merumuskan kerangka teori dan metode penelitian.", "Menyusun kuesioner dan rencana pengumpulan data."],
      learnings: ["Menulis argumen ilmiah yang runtut dan logis.", "Memahami struktur penyusunan metodologi riset sosial.", "Menganalisis fenomena berdasarkan data kuantitatif/kualitatif."],
      nextStep: "Detail riset ini mencakup proposal PDF lengkap, lembar bimbingan, poster penelitian, dan dokumentasi lomba."
    }
  },
  {
    title: "Gerakan Literasi & Duta Baca",
    category: "Literasi",
    description: "Kampanye minat baca dan edukasi literasi tingkat regional bersama Paguyuban Duta Baca Kabupaten Cirebon.",
    impact: "Membentuk keterampilan komunikasi publik, advokasi sosial, dan kepemimpinan gerakan pemuda.",
    tech: ["Advokasi Literasi", "Komunikasi Publik", "Penjangkauan Komunitas", "Media Sosial"],
    image: "/assets/project-literasi.svg",
    documents: [
      { title: "Piagam Juara Duta Baca", href: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },
      { title: "Sertifikat Pelatihan Jurnalistik", href: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
    ],
    gallery: gallery("literasi-project"),
    detail: {
      role: "Pengurus / Inisiator Program",
      year: "2024 - Sekarang",
      overview: "Program advokasi literasi ini dirancang untuk meningkatkan kesadaran membaca masyarakat melalui kampanye interaktif dan penyuluhan.",
      story: "Duta Baca mengajarkan saya bahwa literasi bukan sekadar membaca buku, tetapi membangun ekosistem belajar yang ramah dan aktif di lingkungan masyarakat.",
      process: ["Merancang program kunjungan literasi ke desa-desa.", "Mengisi sesi edukasi dan public speaking di sekolah.", "Mengelola konten kampanye di platform digital."],
      learnings: ["Berbicara secara terarah di depan audiens publik.", "Mengelola koordinasi dengan dinas perpustakaan daerah.", "Merancang kampanye edukasi yang menarik minat pemuda."],
      nextStep: "Detail bagian ini memuat foto dokumentasi program literasi, sertifikat pendukung, dan kliping berita."
    }
  },
  {
    title: "OZONE FACTORY & Manajemen Promosi",
    category: "Organisasi",
    description: "Pengalaman wirausaha kreatif sekolah sebagai Manajer Promosi PT. OZONE FACTORY di FCPS MAN 4 Cirebon.",
    impact: "Mengasah kerja sama tim, perancangan ide promosi kreatif, koordinasi konten, dan tanggung jawab organisasi.",
    tech: ["Strategi Promosi", "Koordinasi Konten", "Kerjasama Tim", "Manajemen Proyek"],
    image: "/assets/project-film-2.svg",
    documents: [{ title: "Piagam Penghargaan Promosi", href: "/assets/docs/sertifikat-manager-promosi.pdf" }],
    gallery: gallery("ozone"),
    detail: {
      role: "Manajer Promosi",
      year: "2023 - 2024",
      overview: "Peran wirausaha sekolah yang mengajarkan cara menerjemahkan rencana kegiatan ke dalam bentuk materi promosi digital.",
      story: "Di promosi, komunikasi adalah kunci utama untuk menarik kepercayaan publik, mempromosikan nilai kegiatan, dan menjaga reputasi organisasi secara konsisten.",
      process: ["Menyusun konsep desain dan konten promosi.", "Membagi alur kerja pembuatan video iklan bersama tim.", "Mengatur jadwal publikasi di media sosial."],
      learnings: ["Bertanggung jawab dalam struktur organisasi formal.", "Mengoordinasikan kebutuhan media antar divisi.", "Menganalisis efektivitas konten promosi digital."],
      nextStep: "Detail bagian ini mencakup dokumentasi poster promosi, hasil video promosi, dan ulasan kinerja tim."
    }
  }
];

export const germanProjects: PortofolioProject[] = [
  {
    title: "Manuskrip",
    category: "Film",
    description: "Ein Kurzfilm von OZONE ENTERTAINMENT, der Regieführung, Schnitt und kreatives Teammanagement schult.",
    impact: "Entwicklung von Fähigkeiten im visuellen Storytelling, der Regie und dem gesamten Produktionsablauf.",
    tech: ["Regie", "Filmschnitt", "CapCut", "Storytelling"],
    image: "/assets/project-manuskrip.svg",
    demoLinks: [{ label: "Film Ansehen", href: "https://youtu.be/nKtWz8FE1to?si=O_jql3oG3xq3VXni" }],
    gallery: gallery("manuskrip"),
    detail: {
      role: "Regisseur und Editor",
      year: "2023",
      overview: "Manuskrip ist ein Kurzfilmprojekt der Schule, das Storytelling, Bildkomposition, Schauspielerführung und Postproduktion verbindet.",
      story: "Dieses Projekt hat bewiesen, dass eine kreative Idee nur durch strukturierte Teamarbeit, visuelle Detailgenauigkeit und ein gutes Schnitttempo ihre volle Wirkung entfaltet.",
      process: ["Drehbucherstellung und visuelle Konzeption.", "Leitung des Drehs vor Ort mit den Schauspielern.", "Filmschnitt und Tonmischung der Audiodateien."],
      learnings: ["Schnelle ästhetische und technische Entscheidungen treffen.", "Kollaboratives Arbeiten im Kreativteam anleiten.", "Dynamische Strukturen im Storytelling verstehen."],
      nextStep: "Dieses Projekt enthält Besetzungslisten, Setfotos, offizielle Filmplakate und Produktionsdokumente."
    }
  },
  {
    title: "Mawar Merah di Bawah Langit Biru",
    category: "Film",
    description: "Ein Kurzfilm (2024), der Kameratechnik, Produktionsleitung und die Arbeitsabläufe in der Produktion schult.",
    impact: "Schulung der Disziplin von der Vorbereitung (Pre-Production) bis zum fertigen Schnitt (Post-Production).",
    tech: ["Kamera", "Produktionsleitung", "Filmschnitt", "Storytelling"],
    image: "/assets/project-mawar.svg",
    demoLinks: [
      { label: "Offizieller Trailer", href: "https://youtu.be/dTxlNTla91Q?si=HDZUIED_hqNuyAzk" },
      { label: "Film Ansehen", href: "https://youtu.be/35d63Y0m80M?si=v7_39SxPJdVZymBh" }
    ],
    gallery: gallery("mawar"),
    detail: {
      role: "Mitglied des Produktionsteams",
      year: "2024",
      overview: "Mawar Merah di Bawah Langit Biru ist ein Kurzfilm, der die Produktionskoordination und die visuelle Sensibilität des Teams testete.",
      story: "Durch diesen Film habe ich gelernt, verschiedene Meinungen zu harmonisieren, emotionale Botschaften visuell zu übersetzen und Dreharbeiten pünktlich abzuschließen.",
      process: ["Ausarbeitung der Handlung und Requisitenplanung.", "Koordination der Drehpläne zwischen verschiedenen Abteilungen.", "Unterstützung beim finalen Bild- und Tonschnitt."],
      learnings: ["Strenges Zeitmanagement während der Dreharbeiten einhalten.", "Emotionale Botschaften visuell vermitteln.", "Effektiv unter der Leitung des Regisseurs arbeiten."],
      nextStep: "Dieses Projekt enthält Setfotos, Werbeplakate, Crew-Listen und den Abspann."
    }
  },
  {
    title: "Forschungsprojekt Geisteswissenschaften",
    category: "Riset",
    description: "Zwei Forschungsentwürfe zur Erhaltung der Landessprache im öffentlichen Raum und zum Einfluss von Arbeitsmigranten-Eltern auf das Verhalten der Kinder.",
    impact: "Schärfung des kritischen Denkens, der Auswertung sozialer Daten und des verfassen wissenschaftlicher Arbeiten.",
    tech: ["Forschung", "Sozialwissenschaft", "Wissenschaftliches Schreiben", "Datenanalyse"],
    image: "/assets/project-riset.svg",
    documents: [
      { title: "Erhalt der Landessprache", href: "/assets/docs/proposal-bahasa-nasional.pdf" },
      { title: "Einfluss von Arbeitsmigranten-Eltern", href: "/assets/docs/riset-pekerja-migran.pdf" }
    ],
    gallery: gallery("riset"),
    detail: {
      role: "Hauptforscher / KIR Team",
      year: "2023 - 2024",
      overview: "Diese beiden sozialwissenschaftlichen Arbeiten wurden entworfen, um gesellschaftliche Fragestellungen mit erprobten Methoden zu analysieren.",
      story: "Die Forschungsarbeit lehrte mich, dass soziale Probleme nicht auf Annahmen beruhen dürfen, sondern auf der Basis von Fakten und Theorien belegt werden müssen.",
      process: ["Problemidentifikation und Erstellung der Einleitung.", "Ausarbeitung des theoretischen Rahmens und der Methodik.", "Erstellung des Fragebogens und Datensammlungsplans."],
      learnings: ["Wissenschaftliche Argumente logisch und nachvollziehbar verfassen.", "Den Aufbau sozialwissenschaftlicher Forschungsmethoden verstehen.", "Phänomene auf der Grundlage von Daten auswerten."],
      nextStep: "Dieses Projekt enthält die vollständige PDF-Forschungsarbeit, Beratungsdokumente und Wettbewerbsbilder."
    }
  },
  {
    title: "Lesekampagne & Buchbotschafter",
    category: "Literasi",
    description: "Lesekampagne und Bildungsarbeit auf regionaler Ebene mit der Duta Baca Vereinigung Cirebon.",
    impact: "Aufbau von Fähigkeiten in der Öffentlichkeitsarbeit, gesellschaftlichen Aufklärung und Jugendführung.",
    tech: ["Leseförderung", "Präsentationen", "Community Outreach", "Social Media"],
    image: "/assets/project-literasi.svg",
    documents: [
      { title: "Siegerurkunde Duta Baca", href: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },
      { title: "Zertifikat Journalismus", href: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
    ],
    gallery: gallery("literasi-project"),
    detail: {
      role: "Vorstandsmitglied / Programmleiter",
      year: "2024 - Jetzt",
      overview: "Dieses Leseförderungsprogramm wurde entwickelt, um das Lesebewusstsein durch interaktive Kampagnen und Seminare zu stärken.",
      story: "Als Buchbotschafter habe ich gelernt, dass Lesekompetenz über das Lesen hinausgeht: Es schafft ein freundliches Lernumfeld in der Gesellschaft.",
      process: ["Konzeption von Alphabetisierungskampagnen in Dörfern.", "Durchführung von Vorträgen und Bildungsseminaren in Schulen.", "Betreuung der Social-Media-Aufklärungskampagne."],
      learnings: ["Strukturiert und zielgerichtet vor Publikum sprechen.", "Koordination mit staatlichen Bibliotheksdiensten leiten.", "Bildungskampagnen entwerfen, die Jugendliche ansprechen."],
      nextStep: "Dieser Bereich enthält Projektdokumente, Unterstützungszertifikate und Medienberichte."
    }
  },
  {
    title: "OZONE FACTORY & Marketingleitung",
    category: "Organisasi",
    description: "Schulische Unternehmenserfahrung als Marketingleiter der PT. OZONE FACTORY bei FCPS MAN 4 Cirebon.",
    impact: "Schärfung der Teamarbeit, Entwicklung kreativer Werbekonzepte, Koordination von Inhalten und Übernahme von Verantwortung.",
    tech: ["Marketingstrategie", "Inhaltskoordination", "Teamwork", "Projektmanagement"],
    image: "/assets/project-film-2.svg",
    documents: [{ title: "Auszeichnung Marketingleitung", href: "/assets/docs/sertifikat-manager-promosi.pdf" }],
    gallery: gallery("ozone"),
    detail: {
      role: "Marketingmanager",
      year: "2023 - 2024",
      overview: "Eine schulische Unternehmenserfahrung, bei der gelernt wurde, Pläne in digitale Werbeinhalte umzusetzen.",
      story: "Im Marketing ist die Kommunikation der Schlüssel, um das Vertrauen des Publikums zu gewinnen und den Ruf der Organisation zu wahren.",
      process: ["Erstellung von Designkonzepten und Werbeinhalten.", "Koordination der Videoanzeigenerstellung im Team.", "Planung von Veröffentlichungsterminen auf Social Media."],
      learnings: ["Verantwortung in einer formalen Organisationsstruktur übernehmen.", "Medienanforderungen zwischen Abteilungen koordinieren.", "Effektivität digitaler Werbeinhalte analysieren."],
      nextStep: "Dieser Bereich enthält Werbeplakate, Videodokumentationen und Leistungsbewertungen des Teams."
    }
  }
];
