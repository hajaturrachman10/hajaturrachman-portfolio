import type { LucideIcon } from "lucide-react";
import { Camera, Code2, Languages, UsersRound } from "lucide-react";

export type SkillGroup = {
  title: string;
  icon: LucideIcon;
  skills: { name: string; level: number; note: string }[];
};

export const indonesianSkillGroups: SkillGroup[] = [
  { title: "Bahasa & Komunikasi", icon: Languages, skills: [{ name: "Bahasa Jerman", level: 74, note: "Target ECL B2" }, { name: "Komunikasi Publik", level: 86, note: "Duta Baca & organisasi" }, { name: "Komunikasi Tim", level: 88, note: "Koordinasi proyek" }] },
  { title: "Kreatif & Produksi", icon: Camera, skills: [{ name: "Canva", level: 82, note: "Desain konten" }, { name: "CapCut", level: 84, note: "Penyuntingan video" }, { name: "Seni Bercerita", level: 80, note: "Film pendek" }] },
  { title: "Organisasi", icon: UsersRound, skills: [{ name: "Kepemimpinan", level: 84, note: "Pengurus inti" }, { name: "Manajemen Tim", level: 82, note: "Produksi & promosi" }, { name: "Pemecahan Masalah", level: 81, note: "Adaptif" }] },
  { title: "Teknis Dasar", icon: Code2, skills: [{ name: "Aplikasi Perkantoran", level: 78, note: "Dokumen & administrasi" }, { name: "Riset Dasar", level: 78, note: "KIR & MYRES" }, { name: "Manajemen Waktu", level: 83, note: "Belajar terstruktur" }] }
];

export const germanSkillGroups: SkillGroup[] = [
  { title: "Sprache & Kommunikation", icon: Languages, skills: [{ name: "Deutsch", level: 74, note: "Ziel: ECL B2" }, { name: "Präsentation", level: 86, note: "Duta Baca & Vereine" }, { name: "Teamkommunikation", level: 88, note: "Projektkoordination" }] },
  { title: "Kreativität & Produktion", icon: Camera, skills: [{ name: "Canva", level: 82, note: "Inhaltserstellung" }, { name: "CapCut", level: 84, note: "Videobearbeitung" }, { name: "Storytelling", level: 80, note: "Kurzfilme" }] },
  { title: "Organisation", icon: UsersRound, skills: [{ name: "Leadership", level: 84, note: "Vorstandsmitglied" }, { name: "Teamleitung", level: 82, note: "Produktion & Marketing" }, { name: "Problemlösung", level: 81, note: "Anpassungsfähig" }] },
  { title: "Grundfertigkeiten", icon: Code2, skills: [{ name: "Microsoft Office", level: 78, note: "Administration" }, { name: "Wissenschaft", level: 78, note: "KIR & MYRES Forschung" }, { name: "Zeitmanagement", level: 83, note: "Strukturiertes Lernen" }] }
];
