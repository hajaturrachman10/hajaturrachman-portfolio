import type { LucideIcon } from "lucide-react";
import { BadgeCheck, FileText, Megaphone, Music, PenTool, Trophy, UtensilsCrossed } from "lucide-react";

export type Achievement = {
  title: string;
  category: string;
  year: string;
  description: string;
  icon: LucideIcon;
  image: string;
  document?: string;
};

export const indonesianAchievements: Achievement[] = [
  { title: "Juara Favorit Putra Duta Baca 2024", category: "Literasi", year: "2024", description: "Piagam penghargaan resmi dari Dinas Kearsipan dan Perpustakaan Kabupaten Cirebon atas kontribusi literasi publik.", icon: Trophy, image: "/assets/doc-previews/sertifikat-duta-baca-favorit.jpg", document: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },
  { title: "Juara 1 Musikalisasi Hadis", category: "Kompetisi", year: "2024", description: "Juara 1 School Talent Competition Cyber X UIN Siber Syekh Nurjati Cirebon bidang seni musik keagamaan.", icon: Music, image: "/assets/doc-previews/sertifikat-musikalisasi-hadis.jpg", document: "/assets/docs/sertifikat-musikalisasi-hadis.pdf" },
  { title: "OSN-K Fisika", category: "Akademik", year: "2023", description: "Sertifikat resmi peserta Olimpiade Sains Nasional tingkat Kabupaten/Kota bidang studi Fisika.", icon: BadgeCheck, image: "/assets/doc-previews/sertifikat-osnk-fisika.jpg", document: "/assets/docs/sertifikat-osnk-fisika.pdf" },
  { title: "Manajer Promosi PT. OZONE FACTORY", category: "Organisasi", year: "2024", description: "Sertifikat penghargaan sebagai Manajer Promosi dalam program wirausaha kreatif sekolah.", icon: Megaphone, image: "/assets/doc-previews/sertifikat-manager-promosi.jpg", document: "/assets/docs/sertifikat-manager-promosi.pdf" },
  { title: "Kompetensi Tata Boga", category: "Praktik", year: "2024", description: "Sertifikat uji kompetensi praktis bidang kuliner dengan predikat kelulusan sangat memuaskan.", icon: UtensilsCrossed, image: "/assets/doc-previews/sertifikat-tata-boga.jpg", document: "/assets/docs/sertifikat-tata-boga.pdf" },
  { title: "Pelatihan Jurnalis & Media Sosial", category: "Pelatihan", year: "2024", description: "Sertifikat resmi pelatihan penulisan jurnalisme warga dan pengelolaan media sosial di TBM Sejuta Harapan.", icon: PenTool, image: "/assets/doc-previews/sertifikat-tbm-sejuta-harapan.jpg", document: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
];

export const germanAchievements: Achievement[] = [
  { title: "Beliebtester Botschafter für Lesen 2024", category: "Alphabetisierung", year: "2024", description: "Offizielle Auszeichnung des Bibliotheksdienstes Cirebon für den Beitrag zur öffentlichen Leseförderung.", icon: Trophy, image: "/assets/doc-previews/sertifikat-duta-baca-favorit.jpg", document: "/assets/docs/sertifikat-duta-baca-favorit.pdf" },

  { title: "1. Platz Vertonung von Hadithen", category: "Wettbewerb", year: "2024", description: "1. Platz beim Schulwettbewerb Cyber X der UIN Siber Syekh Nurjati Cirebon im Bereich religiöser Musikkunst.", icon: Music, image: "/assets/doc-previews/sertifikat-musikalisasi-hadis.jpg", document: "/assets/docs/sertifikat-musikalisasi-hadis.pdf" },
  { title: "OSN-K Physikolympiade", category: "Akademisch", year: "2023", description: "Offizielles Teilnehmerzertifikat der Nationalen Wissenschaftsolympiade auf Stadtebene im Fach Physik.", icon: BadgeCheck, image: "/assets/doc-previews/sertifikat-osnk-fisika.jpg", document: "/assets/docs/sertifikat-osnk-fisika.pdf" },
  { title: "Marketingmanager PT. OZONE FACTORY", category: "Organisation", year: "2024", description: "Auszeichnung als Marketingmanager im Rahmen des kreativen Unternehmertums der Schule.", icon: Megaphone, image: "/assets/doc-previews/sertifikat-manager-promosi.jpg", document: "/assets/docs/sertifikat-manager-promosi.pdf" },
  { title: "Gastronomiekompetenz", category: "Praxis", year: "2024", description: "Zertifikat der kulinarischen Prüfung mit der Note 'Sehr gut'.", icon: UtensilsCrossed, image: "/assets/doc-previews/sertifikat-tata-boga.jpg", document: "/assets/docs/sertifikat-tata-boga.pdf" },
  { title: "Journalismus- & Social-Media-Schulung", category: "Schulung", year: "2024", description: "Teilnahmezertifikat für journalistisches Schreiben und Social-Media-Management bei TBM Sejuta Harapan.", icon: PenTool, image: "/assets/doc-previews/sertifikat-tbm-sejuta-harapan.jpg", document: "/assets/docs/sertifikat-tbm-sejuta-harapan.pdf" }
];
