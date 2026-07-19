import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck, BookOpen, Brain, BriefcaseBusiness, Camera, Code2, Compass,
  FileText, Film, GalleryHorizontalEnd, Globe2, GraduationCap,
  HeartHandshake, Home, Languages, LibraryBig, LockKeyhole, MapPinned,
  Megaphone, Music, PenTool, Plane, Stethoscope, Trophy, UsersRound, UtensilsCrossed
} from "lucide-react";

import { useLanguage } from "@/components/LanguageContext";

export type SkillGroup = { title: string; icon: LucideIcon; skills: { name: string; level: number; note: string }[] };
export type TimelineItem = { title: string; organization: string; period: string; story: string; description: string; points: string[]; icon: LucideIcon };
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

export type GalleryMedia = { type: "image" | "video"; src: string; title: string };
export type GalleryItem = { title: string; caption: string; category: string; image: string; media: GalleryMedia[] };
export type Achievement = { title: string; category: string; year: string; description: string; icon: LucideIcon; image: string; document?: string };

const gallery = (key: string) =>
  Array.from({ length: 8 }, (_, index) => `/assets/gallery/collections/${key}/${key}-${index + 1}.svg`);

// Shared config values (links, metadata, coordinates)
export const sharedConfig = {
  name: "Hajaturrachman",
  preferredName: "Hajaturrachman",
  shortName: "Hajat",
  role: "Future Nursing Ausbildung Candidate",
  email: "Hajaturrachman2006@gmail.com",
  phone: "0851-5851-8090",
  instagram: "@saya.hajat",
  profileImage: "/assets/profile.jpg",
  cvUrl: "/assets/docs/Hajaturrachman-CV.pdf",
  socials: [
    { label: "Instagram", value: "@saya.hajat", href: "https://instagram.com/saya.hajat" },
    { label: "Email", value: "Hajaturrachman2006@gmail.com", href: "mailto:Hajaturrachman2006@gmail.com" },
    { label: "GitHub", value: "Belum diisi", href: "#" },
    { label: "LinkedIn", value: "Belum diisi", href: "#" }
  ]
};

// Indonesian Translation Content (Refined & Formal for Public)
const indonesianContent = {
  siteConfig: {
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
  },
  journeyCards: [
    { title: "Dari Cirebon ke Jakarta Timur", icon: MapPinned, text: "Saya membawa cerita dari Cirebon, lalu belajar membangun langkah yang lebih serius di Jakarta Timur untuk persiapan bahasa Jerman dan masa depan." },
    { title: "Jerman sebagai Arah Karier", icon: Stethoscope, text: "Saya menyiapkan diri untuk Ausbildung perawat di Jerman, bukan hanya sebagai tujuan kerja, tetapi sebagai proses membangun hidup yang lebih mandiri." },
    { title: "Bahasa sebagai Pintu", icon: Languages, text: "Bahasa Jerman menjadi pintu penting. Dari A1, B1, sampai target B2, prosesnya membentuk disiplin, mental, dan cara belajar saya." },
    { title: "Mimpi Keliling Dunia", icon: Plane, text: "Salah satu mimpi besar saya adalah berkeliling dunia setidaknya sekali dalam hidup, melihat budaya lain, dan membawa cerita pulang." }
  ],
  cvAccess: { title: "Akses Curriculum Vitae Hajat", description: "Curriculum Vitae (CV) dapat diakses langsung secara interaktif melalui website ini setelah memasukkan kode akses. Pilihan untuk mengunduh dokumen PDF juga tersedia secara gratis setelah akses dibuka.", icon: FileText },
  skillGroups: [
    { title: "Bahasa & Komunikasi", icon: Languages, skills: [{ name: "Bahasa Jerman", level: 74, note: "Target ECL B2" }, { name: "Komunikasi Publik", level: 86, note: "Duta Baca & organisasi" }, { name: "Komunikasi Tim", level: 88, note: "Koordinasi proyek" }] },
    { title: "Kreatif & Produksi", icon: Camera, skills: [{ name: "Canva", level: 82, note: "Desain konten" }, { name: "CapCut", level: 84, note: "Penyuntingan video" }, { name: "Seni Bercerita", level: 80, note: "Film pendek" }] },
    { title: "Organisasi", icon: UsersRound, skills: [{ name: "Kepemimpinan", level: 84, note: "Pengurus inti" }, { name: "Manajemen Tim", level: 82, note: "Produksi & promosi" }, { name: "Pemecahan Masalah", level: 81, note: "Adaptif" }] },
    { title: "Teknis Dasar", icon: Code2, skills: [{ name: "Aplikasi Perkantoran", level: 78, note: "Dokumen & administrasi" }, { name: "Riset Dasar", level: 78, note: "KIR & MYRES" }, { name: "Manajemen Waktu", level: 83, note: "Belajar terstruktur" }] }
  ],
  timeline: [
    { title: "Persiapan Karir & Bahasa Jerman (Ausbildung)", organization: "GIP - Germany Indonesia Professionals", period: "2025 - Sekarang", story: "Fase ini menjadi titik balik penting: saya tidak hanya belajar bahasa, tetapi mulai menata persiapan karir keperawatan profesional secara matang.", description: "Mengikuti jalur persiapan intensif bahasa Jerman untuk sertifikasi dan rencana penempatan Ausbildung di Jerman.", points: ["Lulus ECL Deutsch B1", "Fokus persiapan ECL Deutsch B2", "Membangun rutinitas belajar mandiri yang disiplin"], icon: GraduationCap },
    { title: "Pendidikan Menengah & Aktivitas Riset", organization: "MAN 4 Cirebon - MIPA", period: "2022 - 2025", story: "Di masa sekolah, saya aktif mengeksplorasi minat ilmiah dan organisasi: riset, gerakan literasi, kompetisi akademik, dan produksi film pendek.", description: "Membangun dasar akademik, organisasi, karya ilmiah, dan kegiatan kreatif sekolah.", points: ["Aktif dalam kepengurusan organisasi intra-sekolah", "Peserta OSN-K Fisika dan OSSN Biologi tingkat Kabupaten", "Finalis MYRES bidang sosial humaniora"], icon: BookOpen },
    { title: "Manajemen Promosi & Koordinasi Kreatif", organization: "FCPS MAN 4 Cirebon - PT. OZONE FACTORY", period: "2023 - 2025", story: "Saya belajar bahwa ide kreatif memerlukan tata kelola komunikasi yang terstruktur dan kerja tim yang solid untuk mencapai dampak maksimal.", description: "Mengelola promosi, koordinasi konten komersial, dan komunikasi publik dalam aktivitas sekolah.", points: ["Merancang strategi promosi media digital", "Mengoordinasikan produksi konten antar tim", "Mengasah manajemen proyek kreatif"], icon: Megaphone },
    { title: "Pengembangan Literasi & Komunikasi Publik", organization: "Paguyuban Duta Baca Kabupaten Cirebon", period: "2023 - 2025", story: "Gerakan literasi mengasah keberanian saya dalam berkomunikasi di depan umum dan memperluas relasi sosial.", description: "Terlibat aktif dalam promosi minat baca dan public speaking tingkat regional.", points: ["Juara Favorit Putra Duta Baca Kabupaten Cirebon 2024", "Mendukung program literasi di perpustakaan daerah", "Mengasah keterampilan retorika komunikasi"], icon: LibraryBig },
    { title: "Riset Ilmiah Sosial-Humaniora", organization: "KIR MAN 4 Cirebon", period: "2022 - 2025", story: "Karya ilmiah mengajarkan saya untuk melihat fenomena sosial secara objektif berlandaskan data empiris dan analisis yang kritis.", description: "Mengembangkan riset sosial-humaniora dan penulisan ilmiah akademis.", points: ["Riset pemertahanan bahasa nasional di ruang publik", "Riset pengaruh orang tua pekerja migran terhadap perilaku anak", "Latihan metodologi penelitian kuantitatif/kualitatif"], icon: Brain }
  ],
  achievements: [
    { title: "Surat Rekomendasi Paguyuban Duta Baca", category: "Rekomendasi", year: "2025", description: "Surat rekomendasi resmi dari Ketua Paguyuban Duta Baca Kabupaten Cirebon atas keaktifan sosial dan kepemimpinan gerakan literasi.", icon: FileText, image: "/assets/gallery/literacy-moment.svg", document: "/assets/docs/rekomendasi-duta-baca.pdf" },
    { title: "Surat Rekomendasi GIP (Germany Professionals)", category: "Rekomendasi", year: "2025", description: "Surat rekomendasi resmi dari instruktur bahasa Jerman di Germany Indonesia Professionals atas kedisiplinan dan target B2.", icon: FileText, image: "/assets/gallery/germany-journey.svg", document: "/assets/docs/rekomendasi-gip.pdf" },
    { title: "Surat Rekomendasi Kepala MAN 4 Cirebon", category: "Rekomendasi", year: "2025", description: "Rekomendasi resmi dari kepala sekolah MAN 4 Cirebon atas prestasi riset ilmiah dan kepengurusan wirausaha.", icon: FileText, image: "/assets/gallery/school-memory.svg", document: "/assets/docs/rekomendasi-man4.pdf" },
    { title: "Juara Favorit Putra Duta Baca 2024", category: "Literasi", year: "2024", description: "Piagam penghargaan resmi dari Dinas Kearsipan dan Perpustakaan Kabupaten Cirebon atas kontribusi literasi publik.", icon: Trophy, image: "/assets/doc-previews/sertifikat-duta-baca-favorit.jpg", document: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },
    { title: "Juara 1 Musikalisasi Hadis", category: "Kompetisi", year: "2024", description: "Juara 1 School Talent Competition Cyber X UIN Siber Syekh Nurjati Cirebon bidang seni musik keagamaan.", icon: Music, image: "/assets/doc-previews/sertifikat-musikalisasi-hadis.jpg", document: "/assets/docs/sertifikat-musikalisasi-hadis.pdf" },
    { title: "OSN-K Fisika", category: "Akademik", year: "2023", description: "Sertifikat resmi peserta Olimpiade Sains Nasional tingkat Kabupaten/Kota bidang studi Fisika.", icon: BadgeCheck, image: "/assets/doc-previews/sertifikat-osnk-fisika.jpg", document: "/assets/docs/sertifikat-osnk-fisika.pdf" },
    { title: "Manajer Promosi PT. OZONE FACTORY", category: "Organisasi", year: "2024", description: "Sertifikat penghargaan sebagai Manajer Promosi dalam program wirausaha kreatif sekolah.", icon: Megaphone, image: "/assets/doc-previews/sertifikat-manager-promosi.jpg", document: "/assets/docs/sertifikat-manager-promosi.pdf" },
    { title: "Kompetensi Tata Boga", category: "Praktik", year: "2024", description: "Sertifikat uji kompetensi praktis bidang kuliner dengan predikat kelulusan sangat memuaskan.", icon: UtensilsCrossed, image: "/assets/doc-previews/sertifikat-tata-boga.jpg", document: "/assets/docs/sertifikat-tata-boga.pdf" },
    { title: "Pelatihan Jurnalis & Media Sosial", category: "Pelatihan", year: "2024", description: "Sertifikat resmi pelatihan penulisan jurnalisme warga dan pengelolaan media sosial di TBM Sejuta Harapan.", icon: PenTool, image: "/assets/doc-previews/sertifikat-tbm-sejuta-harapan.jpg", document: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
  ],
  projects: [
    {
      title: "Manuskrip",
      category: "Film" as ProjectCategory,
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
      category: "Film" as ProjectCategory,
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
      category: "Riset" as ProjectCategory,
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
      category: "Literasi" as ProjectCategory,
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
      category: "Organisasi" as ProjectCategory,
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
  ],
  publicGallery: [
    { title: "Perjalanan Persiapan Jerman", caption: "Dokumentasi intensif belajar bahasa Jerman, kelas persiapan, buku pelajaran, dan sertifikasi.", category: "Journey", image: "/assets/gallery/germany-journey.svg", media: gallery("germany").map((src, index) => ({ type: "image" as const, src, title: `Persiapan Jerman ${index + 1}` })) },
    { title: "Mimpi Keliling Dunia", caption: "Destinasi impian, eksplorasi budaya global, dan visi perjalanan masa depan.", category: "Dream", image: "/assets/gallery/world-dream.svg", media: gallery("world").map((src, index) => ({ type: "image" as const, src, title: `World Dream ${index + 1}` })) },
    { title: "Dokumentasi Pendidikan & Sekolah", caption: "Arsip kegiatan MAN 4 Cirebon, kompetisi ilmiah, OSN, dan kepengurusan organisasi.", category: "School", image: "/assets/gallery/school-memory.svg", media: gallery("school").map((src, index) => ({ type: "image" as const, src, title: `Memori Sekolah ${index + 1}` })) },
    { title: "Proyek Kreatif & Film Pendek", caption: "Dokumentasi di balik layar (BTS) syuting, proses editing, poster film, dan tim produksi.", category: "Creative", image: "/assets/gallery/creative-project.svg", media: gallery("creative").map((src, index) => ({ type: "image" as const, src, title: `Proyek Kreatif ${index + 1}` })) },
    { title: "Kampanye Literasi & Duta Baca", caption: "Dokumentasi kegiatan Duta Baca, penyuluhan minat baca, jurnalisme warga, dan komunitas.", category: "Literacy", image: "/assets/gallery/literacy-moment.svg", media: gallery("literacy").map((src, index) => ({ type: "image" as const, src, title: `Literasi ${index + 1}` })) },
    { title: "Arsip Kehidupan", caption: "Kumpulan momen personal bernilai penting yang melatarbelakangi perjalanan hidup.", category: "Life", image: "/assets/gallery/future-life.svg", media: gallery("life").map((src, index) => ({ type: "image" as const, src, title: `Arsip Kehidupan ${index + 1}` })) }
  ],
  valueCards: [
    { title: "Disiplin Belajar", description: "Saya berkomitmen tinggi pada proses belajar bertahap, khususnya dalam persiapan bahasa Jerman ECL B2.", icon: PenTool },
    { title: "Orientasi Pelayanan", description: "Karier keperawatan menuntut empati mendalam, ketahanan fisik-mental, dan rasa tanggung jawab sosial yang tinggi.", icon: Stethoscope },
    { title: "Kolaborasi Tim", description: "Pengalaman riset ilmiah, perfilman sekolah, dan duta baca memperkuat kemampuan koordinasi lintas tim saya.", icon: BriefcaseBusiness },
    { title: "Mobilitas Karir Global", description: "Saya sedang mempersiapkan integrasi kehidupan dan pengembangan karir jangka panjang di Jerman melalui jalur Ausbildung.", icon: Compass }
  ],
  privateVault: {
    title: "Ruang Personal",
    description: "Bagian ini dilindungi secara aman di server. Di sini tersimpan ruang kenangan foto dan cerita keluarga, sahabat, teman dekat, dan pacar.",
    icon: LockKeyhole,
    sections: [
      { id: "family", title: "Keluarga", icon: Home, summary: "Keluarga adalah fondasi besar dalam perjalanan ini. Mereka menjadi alasan kenapa perjuangan ke Jerman terasa punya makna." },
      { id: "sahabat", title: "Sahabat", icon: UsersRound, summary: "Sahabat dari berbagai fase hidup menjadi bagian penting dari cerita yang membentuk karakter." },
      { id: "close-friends", title: "Teman Dekat", icon: HeartHandshake, summary: "Teman dekat dari fase belajar dan persiapan ujian menjadi bagian penting dalam perjalanan akademik." },
      { id: "relationship", title: "Pacar", icon: HeartHandshake, summary: "Hubungan personal yang suportif dan saling menjaga untuk mendukung impian masa depan masing-masing." }
    ]
  },
  featureHighlights: [
    { title: "Peninjau CV", text: "CV dapat dibaca secara interaktif, serta di-download jika diperlukan.", icon: FileText },
    { title: "Cerita Proyek", text: "Setiap proyek menyajikan proses, dokumentasi, dan tautan berkas resmi.", icon: Film },
    { title: "Peta Perjalanan", text: "Merangkum mimpi, riwayat karir, pencapaian akademik, dan fokus hidup.", icon: Globe2 },
    { title: "Galeri Visual", text: "Arsip visual interaktif untuk mendokumentasikan setiap momen penting.", icon: GalleryHorizontalEnd }
  ]
};

// German Translation Content (Deutsch)
const germanContent = {
  siteConfig: {
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
  },
  journeyCards: [
    { title: "Von Cirebon nach Ost-Jakarta", icon: MapPinned, text: "Ich bringe Erfahrungen aus Cirebon mit und gehe in Ost-Jakarta ernsthafte Schritte zur Vorbereitung auf die deutsche Sprache und meine Zukunft." },
    { title: "Deutschland als Karriereziel", icon: Stethoscope, text: "Ich bereite mich auf die Ausbildung zur Pflegefachkraft in Deutschland vor, nicht nur als Job, sondern als Schritt in ein unabhängiges Leben." },
    { title: "Die Sprache als Schlüssel", icon: Languages, text: "Die deutsche Sprache ist der Schlüssel. Der Prozess von A1 über B1 bis zum Ziel B2 prägt meine Disziplin und Lernmethode." },
    { title: "Traum von der Weltreise", icon: Plane, text: "Einer meiner großen Träume ist es, mindestens einmal im Leben die Welt zu bereisen, andere Kulturen kennenzulernen und neue Geschichten mitzubringen." }
  ],
  cvAccess: { title: "Curriculum Vitae Zugang", description: "Der Lebenslauf (CV) kann direkt interaktiv auf dieser Website eingesehen werden, nachdem der Zugangscode eingegeben wurde. Die Option zum Herunterladen des PDF-Dokuments steht nach der Freischaltung kostenlos zur Verfügung.", icon: FileText },
  skillGroups: [
    { title: "Sprache & Kommunikation", icon: Languages, skills: [{ name: "Deutsch", level: 74, note: "Ziel: ECL B2" }, { name: "Präsentation", level: 86, note: "Duta Baca & Vereine" }, { name: "Teamkommunikation", level: 88, note: "Projektkoordination" }] },
    { title: "Kreativität & Produktion", icon: Camera, skills: [{ name: "Canva", level: 82, note: "Inhaltserstellung" }, { name: "CapCut", level: 84, note: "Videobearbeitung" }, { name: "Storytelling", level: 80, note: "Kurzfilme" }] },
    { title: "Organisation", icon: UsersRound, skills: [{ name: "Leadership", level: 84, note: "Vorstandsmitglied" }, { name: "Teamleitung", level: 82, note: "Produktion & Marketing" }, { name: "Problemlösung", level: 81, note: "Anpassungsfähig" }] },
    { title: "Grundfertigkeiten", icon: Code2, skills: [{ name: "Microsoft Office", level: 78, note: "Administration" }, { name: "Wissenschaft", level: 78, note: "KIR & MYRES Forschung" }, { name: "Zeitmanagement", level: 83, note: "Strukturiertes Lernen" }] }
  ],
  timeline: [
    { title: "Karriere- & Sprachvorbereitung Deutschland", organization: "GIP - Germany Indonesia Professionals", period: "2025 - Jetzt", story: "Diese Phase ist ein wichtiger Wendepunkt: Ich lerne nicht nur die Sprache, sondern bereite mich intensiv auf meine berufliche Zukunft in der Krankenpflege vor.", description: "Teilnahme an der Intensivvorbereitung auf Deutschzertifikate und die Ausbildung in Deutschland.", points: ["ECL Deutsch B1 bestanden", "Fokus auf ECL Deutsch B2 Vorbereitung", "Aufbau einer disziplinierten Selbstlernroutine"], icon: GraduationCap },
    { title: "Schulbildung & Forschungsaktivitäten", organization: "MAN 4 Cirebon - MIPA (Naturwissenschaften)", period: "2022 - 2025", story: "Während meiner Schulzeit war ich in wissenschaftlichen und organisatorischen Bereichen aktiv: Forschung, Alphabetisierungsprojekte, akademische Wettbewerbe und Kurzfilmproduktionen.", description: "Aufbau akademischer Grundlagen, Vereinsarbeit und kreativer Schulaktivitäten.", points: ["Aktiv im Vorstand der Schülervertretung", "Teilnehmer der Nationalen Physikolympiade auf Kreisebene", "Finalist bei MYRES im Bereich Sozial- und Geisteswissenschaften"], icon: BookOpen },
    { title: "Marketingmanagement & Kreativkoordination", organization: "FCPS MAN 4 Cirebon - PT. OZONE FACTORY", period: "2023 - 2025", story: "Ich habe gelernt, dass kreative Ideen eine strukturierte Kommunikation und solide Teamarbeit erfordern, um die maximale Wirkung zu erzielen.", description: "Verwaltung von Werbekampagnen, Inhaltskoordination und Öffentlichkeitsarbeit bei Schulprojekten.", points: ["Entwicklung digitaler Marketingstrategien", "Koordination der Inhaltserstellung zwischen Teams", "Schärfung des Managements kreativer Projekte"], icon: Megaphone },
    { title: "Förderung von Alphabetisierung & Rhetorik", organization: "Paguyuban Duta Baca Kabupaten Cirebon", period: "2023 - 2025", story: "Die Alphabetisierungskampagne hat meinen Mut zur öffentlichen Rede gestärkt und mein soziales Netzwerk erweitert.", description: "Aktive Förderung des Lesebedürfnisses und der Rhetorik auf regionaler Ebene.", points: ["Beliebtester männlicher Botschafter für Lesen Cirebon 2024", "Unterstützung von Alphabetisierungsprogrammen in Regionalbibliotheken", "Fortbildung rhetorischer Fähigkeiten in der Kommunikation"], icon: LibraryBig },
    { title: "Sozialwissenschaftliche Forschung", organization: "KIR MAN 4 Cirebon", period: "2022 - 2025", story: "Die wissenschaftliche Arbeit hat mir beigebracht, soziale Phänomene objektiv auf der Grundlage empirischer Daten und kritischer Analysen zu betrachten.", description: "Entwicklung sozialwissenschaftlicher Forschung und akademischen Schreibens.", points: ["Forschung zur Erhaltung der Landessprache im öffentlichen Raum", "Forschung zum Einfluss von Arbeitsmigranten-Eltern auf Kinder", "Erlernen quantitativer und qualitativer Forschungsmethoden"], icon: Brain }
  ],
  achievements: [
    { title: "Empfehlungsschreiben - Lesebotschafter-Vereinigung", category: "Empfehlung", year: "2025", description: "Offizielles Empfehlungsschreiben des Vorsitzenden der Lesebotschafter-Vereinigung für soziale Aktivitäten und Führungsrollen.", icon: FileText, image: "/assets/gallery/literacy-moment.svg", document: "/assets/docs/rekomendasi-duta-baca.pdf" },
    { title: "Empfehlungsschreiben - GIP (Germany Professionals)", category: "Empfehlung", year: "2025", description: "Empfehlung des Deutschlehrers/Koordinators der Germany Indonesia Professionals für Studiendisziplin und das B2-Ziel.", icon: FileText, image: "/assets/gallery/germany-journey.svg", document: "/assets/docs/rekomendasi-gip.pdf" },
    { title: "Empfehlungsschreiben - Schulleiter der MAN 4 Cirebon", category: "Empfehlung", year: "2025", description: "Offizielle Empfehlung des Schulleiters der MAN 4 Cirebon für akademische Leistungen und wirausaha-Leitung.", icon: FileText, image: "/assets/gallery/school-memory.svg", document: "/assets/docs/rekomendasi-man4.pdf" },
    { title: "Beliebtester Botschafter für Lesen 2024", category: "Alphabetisierung", year: "2024", description: "Offizielle Auszeichnung des Bibliotheksdienstes Cirebon für den Beitrag zur öffentlichen Leseförderung.", icon: Trophy, image: "/assets/doc-previews/sertifikat-duta-baca-favorit.jpg", document: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },
    { title: "1. Platz Vertonung von Hadithen", category: "Wettbewerb", year: "2024", description: "1. Platz beim Schulwettbewerb Cyber X der UIN Siber Syekh Nurjati Cirebon im Bereich religiöser Musikkunst.", icon: Music, image: "/assets/doc-previews/sertifikat-musikalisasi-hadis.jpg", document: "/assets/docs/sertifikat-musikalisasi-hadis.pdf" },
    { title: "OSN-K Physikolympiade", category: "Akademisch", year: "2023", description: "Offizielles Teilnehmerzertifikat der Nationalen Wissenschaftsolympiade auf Stadtebene im Fach Physik.", icon: BadgeCheck, image: "/assets/doc-previews/sertifikat-osnk-fisika.jpg", document: "/assets/docs/sertifikat-osnk-fisika.pdf" },
    { title: "Marketingmanager PT. OZONE FACTORY", category: "Organisation", year: "2024", description: "Auszeichnung als Marketingmanager im Rahmen des kreativen Unternehmertums der Schule.", icon: Megaphone, image: "/assets/doc-previews/sertifikat-manager-promosi.jpg", document: "/assets/docs/sertifikat-manager-promosi.pdf" },
    { title: "Gastronomiekompetenz", category: "Praxis", year: "2024", description: "Zertifikat der kulinarischen Prüfung mit der Note 'Sehr gut'.", icon: UtensilsCrossed, image: "/assets/doc-previews/sertifikat-tata-boga.jpg", document: "/assets/docs/sertifikat-tata-boga.pdf" },
    { title: "Journalismus- & Social-Media-Schulung", category: "Schulung", year: "2024", description: "Teilnahmezertifikat für journalistisches Schreiben und Social-Media-Management bei TBM Sejuta Harapan.", icon: PenTool, image: "/assets/doc-previews/sertifikat-tbm-sejuta-harapan.jpg", document: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
  ],
  projects: [
    {
      title: "Manuskrip",
      category: "Film" as ProjectCategory,
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
      category: "Film" as ProjectCategory,
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
      category: "Riset" as ProjectCategory,
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
      category: "Literasi" as ProjectCategory,
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
      category: "Organisasi" as ProjectCategory,
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
  ],
  publicGallery: [
    { title: "Vorbereitung Deutschland", caption: "Deutschunterricht, Intensivkurse, Lehrbücher, Vorbereitungsmaterialien und Sprachprüfungen.", category: "Journey", image: "/assets/gallery/germany-journey.svg", media: gallery("germany").map((src, index) => ({ type: "image" as const, src, title: `Vorbereitung Deutschland ${index + 1}` })) },
    { title: "Traum von der Weltreise", caption: "Traumziele, globale Kulturen und Visionen für zukünftige Reisen.", category: "Dream", image: "/assets/gallery/world-dream.svg", media: gallery("world").map((src, index) => ({ type: "image" as const, src, title: `World Dream ${index + 1}` })) },
    { title: "Schulbildung & Auszeichnungen", caption: "Aktivitäten an der MAN 4 Cirebon, Wissenschaftswettbewerbe, Olympiaden und Vorstandsämter.", category: "School", image: "/assets/gallery/school-memory.svg", media: gallery("school").map((src, index) => ({ type: "image" as const, src, title: `Schulzeit ${index + 1}` })) },
    { title: "Kreativprojekte & Kurzfilme", caption: "Behind-the-scenes (BTS) Fotos, Dreharbeiten, Schnittprozess, Plakate und Produktionsteams.", category: "Creative", image: "/assets/gallery/creative-project.svg", media: gallery("creative").map((src, index) => ({ type: "image" as const, src, title: `Kreativprojekte ${index + 1}` })) },
    { title: "Alphabetisierungskampagnen", caption: "Tätigkeiten als Buchbotschafter, Leseförderungsaktivitäten, Journalismus und Gemeinschaftsarbeit.", category: "Literacy", image: "/assets/gallery/literacy-moment.svg", media: gallery("literacy").map((src, index) => ({ type: "image" as const, src, title: `Alphabetisierung ${index + 1}` })) },
    { title: "Life Archiv", caption: "Sammlung wertvoller persönlicher Momente, die meinen Lebensweg prägen.", category: "Life", image: "/assets/gallery/future-life.svg", media: gallery("life").map((src, index) => ({ type: "image" as const, src, title: `Lebensarchiv ${index + 1}` })) }
  ],
  valueCards: [
    { title: "Disziplinierte Ausbildung", description: "Ich verpflichte mich zu einem strukturierten Lernprozess, insbesondere für die ECL B2 Deutschprüfung.", icon: PenTool },
    { title: "Krankenpflege-Fokus", description: "Krankenpflege erfordert tiefes Mitgefühl, physische und mentale Stärke sowie eine hohe soziale Verantwortung.", icon: Stethoscope },
    { title: "Zusammenarbeit", description: "Erfahrungen in der Forschung, der Kurzfilmproduktion und der Leseförderung stärken meine Kooperationsfähigkeit.", icon: BriefcaseBusiness },
    { title: "Globale Karriere", description: "Ich bereite mich intensiv auf die langfristige Integration und Karriereentwicklung in Deutschland über eine Ausbildung vor.", icon: Compass }
  ],
  privateVault: {
    title: "Persönlicher Bereich",
    description: "Dieser Bereich ist auf dem Server sicher geschützt. Hier werden Fotos und Erinnerungen für Familie, Freunde, engste Bekannte und Partner aufbewahrt.",
    icon: LockKeyhole,
    sections: [
      { id: "family", title: "Familie", icon: Home, summary: "Die Familie ist das Fundament dieser Reise. Sie gibt meinem Weg nach Deutschland einen tiefen Sinn." },
      { id: "sahabat", title: "Engste Freunde", icon: UsersRound, summary: "Freunde aus verschiedenen Lebensphasen prägen meinen Charakter und meine Geschichte." },
      { id: "close-friends", title: "Gute Bekannte", icon: HeartHandshake, summary: "Gute Bekannte aus der Lernphase und Prüfungsvorbereitung sind wichtige Begleiter." },
      { id: "relationship", title: "Partner / Partnerin", icon: HeartHandshake, summary: "Eine unterstützende und wertschätzende persönliche Beziehung zur gegenseitigen Förderung von Zukunftsträumen." }
    ]
  },
  featureHighlights: [
    { title: "CV Viewer", text: "Der Lebenslauf kann direkt online gelesen und bei Bedarf heruntergeladen werden.", icon: FileText },
    { title: "Projektgeschichten", text: "Jedes Projekt zeigt Abläufe, Dokumentationen und offizielle Links.", icon: Film },
    { title: "Reiseroute", text: "Zusammenfassung meiner Träume, Bildung, Leistungen und Fokusbereiche.", icon: Globe2 },
    { title: "Visuelle Galerie", text: "Ein interaktives Archiv zur Dokumentation wichtiger Lebensabschnitte.", icon: GalleryHorizontalEnd }
  ]
};

const translations = {
  id: indonesianContent,
  de: germanContent
};

export function useSiteData() {
  const { language } = useLanguage();
  return translations[language];
}
export function useLanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return { language, setLanguage };
}

// Static exports for Server Components and legacy direct imports
export const siteConfig = indonesianContent.siteConfig;
export const timeline = indonesianContent.timeline;
export const valueCards = indonesianContent.valueCards;
export const skillGroups = indonesianContent.skillGroups;
export const featureHighlights = indonesianContent.featureHighlights;
export const journeyCards = indonesianContent.journeyCards;
export const projects = indonesianContent.projects;
export const publicGallery = indonesianContent.publicGallery;
export const cvAccess = indonesianContent.cvAccess;
export const privateVault = indonesianContent.privateVault;
export const achievements = indonesianContent.achievements;
