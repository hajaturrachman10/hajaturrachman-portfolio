export type GalleryMedia = { type: "image" | "video"; src: string; title: string };
export type GalleryItem = { title: string; caption: string; category: string; image: string; media: GalleryMedia[] };

const gallery = (key: string) =>
  Array.from({ length: 8 }, (_, index) => `/assets/gallery/collections/${key}/${key}-${index + 1}.svg`);

export const indonesianPublicGallery: GalleryItem[] = [
  { title: "Perjalanan Persiapan Jerman", caption: "Dokumentasi intensif belajar bahasa Jerman, kelas persiapan, buku pelajaran, dan sertifikasi.", category: "Journey", image: "/assets/gallery/germany-journey.svg", media: gallery("germany").map((src, index) => ({ type: "image" as const, src, title: `Persiapan Jerman ${index + 1}` })) },
  { title: "Mimpi Keliling Dunia", caption: "Destinasi impian, eksplorasi budaya global, dan visi perjalanan masa depan.", category: "Dream", image: "/assets/gallery/world-dream.svg", media: gallery("world").map((src, index) => ({ type: "image" as const, src, title: `World Dream ${index + 1}` })) },
  { title: "Dokumentasi Pendidikan & Sekolah", caption: "Arsip kegiatan MAN 4 Cirebon, kompetisi ilmiah, OSN, dan kepengurusan organisasi.", category: "School", image: "/assets/gallery/school-memory.svg", media: gallery("school").map((src, index) => ({ type: "image" as const, src, title: `Memori Sekolah ${index + 1}` })) },
  { title: "Proyek Kreatif & Film Pendek", caption: "Dokumentasi di balik layar (BTS) syuting, proses editing, poster film, dan tim produksi.", category: "Creative", image: "/assets/gallery/creative-project.svg", media: gallery("creative").map((src, index) => ({ type: "image" as const, src, title: `Proyek Kreatif ${index + 1}` })) },
  { title: "Kampanye Literasi & Duta Baca", caption: "Dokumentasi kegiatan Duta Baca, penyuluhan minat baca, jurnalisme warga, dan komunitas.", category: "Literacy", image: "/assets/gallery/literacy-moment.svg", media: gallery("literacy").map((src, index) => ({ type: "image" as const, src, title: `Literasi ${index + 1}` })) },
  { title: "Arsip Kehidupan", caption: "Kumpulan momen personal bernilai penting yang melatarbelakangi perjalanan hidup.", category: "Life", image: "/assets/gallery/future-life.svg", media: gallery("life").map((src, index) => ({ type: "image" as const, src, title: `Arsip Kehidupan ${index + 1}` })) }
];

export const germanPublicGallery: GalleryItem[] = [
  { title: "Vorbereitung Deutschland", caption: "Deutschunterricht, Intensivkurse, Lehrbücher, Vorbereitungsmaterialien und Sprachprüfungen.", category: "Journey", image: "/assets/gallery/germany-journey.svg", media: gallery("germany").map((src, index) => ({ type: "image" as const, src, title: `Vorbereitung Deutschland ${index + 1}` })) },
  { title: "Traum von der Weltreise", caption: "Traumziele, globale Kulturen und Visionen für zukünftige Reisen.", category: "Dream", image: "/assets/gallery/world-dream.svg", media: gallery("world").map((src, index) => ({ type: "image" as const, src, title: `World Dream ${index + 1}` })) },
  { title: "Schulbildung & Auszeichnungen", caption: "Aktivitäten an der MAN 4 Cirebon, Wissenschaftswettbewerbe, Olympiaden und Vorstandsämter.", category: "School", image: "/assets/gallery/school-memory.svg", media: gallery("school").map((src, index) => ({ type: "image" as const, src, title: `Schulzeit ${index + 1}` })) },
  { title: "Kreativprojekte & Kurzfilme", caption: "Behind-the-scenes (BTS) Fotos, Dreharbeiten, Schnittprozess, Plakate und Produktionsteams.", category: "Creative", image: "/assets/gallery/creative-project.svg", media: gallery("creative").map((src, index) => ({ type: "image" as const, src, title: `Kreativprojekte ${index + 1}` })) },
  { title: "Alphabetisierungskampagnen", caption: "Tätigkeiten als Buchbotschafter, Leseförderungsaktivitäten, Journalismus und Gemeinschaftsarbeit.", category: "Literacy", image: "/assets/gallery/literacy-moment.svg", media: gallery("literacy").map((src, index) => ({ type: "image" as const, src, title: `Alphabetisierung ${index + 1}` })) },
  { title: "Life Archiv", caption: "Sammlung wertvoller persönlicher Momente, die meinen Lebensweg prägen.", category: "Life", image: "/assets/gallery/future-life.svg", media: gallery("life").map((src, index) => ({ type: "image" as const, src, title: `Lebensarchiv ${index + 1}` })) }
];
