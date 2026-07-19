export type Person = {
  name: string;
  role: string;
  image: string;
  story: string;
};

export type VaultSection = {
  id: string;
  title: string;
  summary: string;
  people: Person[];
  content: string[];
  memories: { src: string; caption: string }[];
};

export const privateVaultData = {
  title: "Ruang Personal",
  description: "Bagian ini dilindungi secara aman di server. Di sini tersimpan ruang kenangan foto dan cerita keluarga, sahabat, teman dekat, dan pacar.",
  sections: [
    {
      id: "family",
      title: "Keluarga",
      summary: "Keluarga adalah fondasi besar dalam perjalanan ini. Mereka menjadi alasan kenapa perjuangan ke Jerman terasa punya makna.",
      people: [
        { name: "Mama Yano", role: "Ayah", image: "/assets/people/mama-yano.svg", story: "Sosok pekerja keras yang mengajarkan tanggung jawab, ketahanan, dan kesederhanaan." },
        { name: "Mimi Ijah", role: "Ibu", image: "/assets/people/mimi-ijah.svg", story: "Sumber doa dan kekuatan emosional dalam perjalanan keluarga." },
        { name: "Mas Nur", role: "Kakak Pertama", image: "/assets/people/mas-nur.svg", story: "Kakak laki-laki tertua yang menjadi teladan kerja keras dan tanggung jawab." },
        { name: "Yayu Megih", role: "Kakak Ipar", image: "/assets/people/yayu-megih.svg", story: "Kakak ipar yang turut menghadirkan kehangatan dan dukungan di dalam keluarga." },
        { name: "Rafisqy", role: "Ponakan", image: "/assets/people/rafisqy.svg", story: "Ponakan yang selalu menjadi penceria suasana rumah dengan kepolosannya." },
        { name: "Yayu Nir", role: "Kakak Kedua", image: "/assets/people/yayu-nir.svg", story: "Kakak perempuan kedua yang selalu mendukung langkah pendidikan dan masa depan saya." },
        { name: "Mas Oman", role: "Kakak Ipar", image: "/assets/people/mas-oman.svg", story: "Kakak ipar yang ramah dan selalu membawa keceriaan dalam keluarga." },
        { name: "Evi", role: "Ponakan", image: "/assets/people/evi.svg", story: "Ponakan perempuan yang ceria dan menjadi warna tersendiri dalam keluarga." },
        { name: "Agis", role: "Ponakan", image: "/assets/people/agis.svg", story: "Ponakan laki-laki yang aktif dan menambah kehangatan di rumah." },
        { name: "Yayu Atun", role: "Kakak Ketiga", image: "/assets/people/yayu-atun.svg", story: "Kakak perempuan ketiga yang turut menjadi bagian dari pilar dukungan keluarga." },
        { name: "Mas Syifa", role: "Kakak Ipar", image: "/assets/people/mas-syifa.svg", story: "Kakak ipar yang suportif dan selalu siap membantu dalam berbagai hal." },
        { name: "Devanka", role: "Ponakan", image: "/assets/people/devanka.svg", story: "Ponakan terkecil yang membawa keceriaan baru di tengah keluarga." }
      ],
      content: [
        "Sebagai anak bungsu, perjalanan ini tidak pernah terasa berdiri sendiri.",
        "Rencana ke Jerman bukan hanya mimpi personal, tetapi juga bentuk dedikasi kepada orang tua dan keluarga.",
        "Setiap doa dari rumah adalah bensin utama untuk terus melangkah di tanah rantau."
      ],
      memories: [
        { src: "/assets/gallery/memories/family-1.svg", caption: "Kumpul hangat keluarga besar di Cirebon saat hari raya." },
        { src: "/assets/gallery/memories/family-2.svg", caption: "Momen melepas keberangkatan menuju Jakarta untuk belajar bahasa Jerman." },
        { src: "/assets/gallery/memories/family-3.svg", caption: "Dukungan penuh dari orang tua saat kelulusan dan persiapan ujian B2." },
        { src: "/assets/gallery/memories/family-4.svg", caption: "Dukungan moral di setiap tahapan hidup yang menantang." },
        { src: "/assets/gallery/memories/family-5.svg", caption: "Momen berharga bersama di ruang makan rumah Cirebon." }
      ]
    },
    {
      id: "sahabat",
      title: "Sahabat",
      summary: "Sahabat dari berbagai fase hidup menjadi bagian penting dari cerita yang membentuk karakter saya.",
      people: [
        { name: "Gilang", role: "Sahabat SD", image: "/assets/people/gilang.svg", story: "Sahabat sejak masa sekolah dasar yang menyaksikan awal mula impian-impian kecil saya." },
        { name: "Sena", role: "Sahabat SD", image: "/assets/people/sena.svg", story: "Teman masa kecil yang bersama-sama tumbuh dalam kesederhanaan di Cirebon." },
        { name: "Fadil", role: "Sahabat SMP", image: "/assets/people/fadil.svg", story: "Teman berdiskusi yang menyenangkan sejak masa sekolah menengah pertama." },
        { name: "Hanif", role: "Sahabat SMP", image: "/assets/people/hanif.svg", story: "Sahabat yang selalu solid dan mendukung dalam setiap fase pencarian jati diri." },
        { name: "Nagof", role: "Sahabat SMA", image: "/assets/people/nagof.svg", story: "Sahabat masa SMA yang setia kawan dan selalu siap menemani dalam suka maupun duka." },
        { name: "Afnan", role: "Sahabat SMA", image: "/assets/people/afnan.svg", story: "Sahabat seperjuangan di riset dan kelas MIPA yang cerdas dan kritis." },
        { name: "Devan", role: "Sahabat Tongkrongan", image: "/assets/people/devan.svg", story: "Sahabat tongkrongan yang selalu asik, seru, dan solid dalam berbagi cerita." }
      ],
      content: [
        "Sahabat adalah saksi dari proses naik turunnya kehidupan yang jarang terlihat di publik.",
        "Dari masa bermain di SD, masa pesantren/sekolah di SMP, hingga kolaborasi riset di SMA.",
        "Hubungan ini dirawat agar kenangan manis dan perjuangan masa sekolah tetap abadi."
      ],
      memories: [
        { src: "/assets/gallery/memories/sahabat-1.svg", caption: "Keseruan masa kecil bermain di lingkungan desa Cirebon." },
        { src: "/assets/gallery/memories/sahabat-2.svg", caption: "Diskusi kelompok dan kerja sama riset ilmiah saat di sekolah." },
        { src: "/assets/gallery/memories/sahabat-3.svg", caption: "Momen berkumpul santai setelah ujian akhir sekolah selesai." },
        { src: "/assets/gallery/memories/sahabat-4.svg", caption: "Kenangan wisuda dan perpisahan sekolah MAN 4 Cirebon." },
        { src: "/assets/gallery/memories/sahabat-5.svg", caption: "Sahabat sejati yang saling menyemangati mengejar impian." }
      ]
    },
    {
      id: "close-friends",
      title: "Teman Dekat",
      summary: "Teman dekat dari fase belajar bahasa Jerman menjadi partner penting dalam perjalanan akademik.",
      people: [
        { name: "Aji", role: "Partner B1 & B2", image: "/assets/people/aji.svg", story: "Partner speaking yang sangat membantu dalam mengasah kelancaran bahasa Jerman dari level B1 hingga target B2." },
        { name: "Nisa", role: "Teman Dekat", image: "/assets/people/nisa.svg", story: "Teman berbagi cerita dan keluh kesah perjuangan belajar yang selalu memberikan perspektif positif." },
        { name: "Ryan", role: "Partner B2", image: "/assets/people/ryan.svg", story: "Partner latihan menulis (Schreiben) dan membaca (Lesen) intensif untuk persiapan ujian ECL B2." }
      ],
      content: [
        "Teman dekat membantu membuat proses belajar bahasa Jerman yang rumit terasa lebih menyenangkan.",
        "Di kelas persiapan Jerman, memiliki partner yang satu visi sangatlah krusial.",
        "Ruang ini menyimpan apresiasi untuk mereka yang saling bantu demi mimpi bersama ke Jerman."
      ],
      memories: [
        { src: "/assets/gallery/memories/close-friends-1.svg", caption: "Sesi latihan speaking bahasa Jerman intensif bersama partner." },
        { src: "/assets/gallery/memories/close-friends-2.svg", caption: "Momen istirahat kelas bahasa, berbagi impian tentang Ausbildung di Jerman." },
        { src: "/assets/gallery/memories/close-friends-3.svg", caption: "Merayakan kelulusan sertifikasi bahasa tingkat sebelumnya bersama-sama." },
        { src: "/assets/gallery/memories/close-friends-4.svg", caption: "Latihan mandiri bersama setiap akhir pekan di perpustakaan." },
        { src: "/assets/gallery/memories/close-friends-5.svg", caption: "Mempersiapkan berkas keberangkatan Ausbildung bersama partner." }
      ]
    },
    {
      id: "relationship",
      title: "Pacar",
      summary: "Hubungan personal yang suportif dan saling menjaga untuk mendukung impian masa depan masing-masing.",
      people: [
        { name: "Amel", role: "Pacar", image: "/assets/people/amel.svg", story: "Amel adalah sosok yang suportif, kalem, baik, pekerja keras, dan religius. Hubungan ini menjadi ruang belajar untuk saling menjaga dan mendukung masa depan." }
      ],
      content: [
        "Hubungan ini dimulai sejak 16 Mei 2023.",
        "Dijalani dengan penuh komitmen secara LDR (Jakarta Timur - Cirebon).",
        "Prinsip kami: hubungan yang sehat adalah hubungan yang saling mendorong untuk meraih cita-cita masa depan."
      ],
      memories: [
        { src: "/assets/gallery/memories/pacar-1.svg", caption: "Momen komunikasi LDR yang saling menyemangati di sela-sela kesibukan belajar." },
        { src: "/assets/gallery/memories/pacar-2.svg", caption: "Dukungan doa dan motivasi untuk persiapan ujian ECL Deutsch B2." },
        { src: "/assets/gallery/memories/pacar-3.svg", caption: "Janji saling mendukung demi masa depan karier yang mandiri." },
        { src: "/assets/gallery/memories/pacar-4.svg", caption: "Saling menguatkan dan menjaga hati meski jarak membentang." },
        { src: "/assets/gallery/memories/pacar-5.svg", caption: "Membangun kemandirian masa depan untuk meraih cita-cita bersama." }
      ]
    }
  ]
};
