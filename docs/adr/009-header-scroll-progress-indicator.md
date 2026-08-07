# ADR-009: Header Scroll Progress Indicator Architecture

- **Status**: Approved
- **Date**: 2026-08-08
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.3 Navigation & Reading Progress Experience

---

## Context

Pada dokumen portofolio berdurasi baca menengah-panjang (seperti timeline persiapan Ausbildung keperawatan Jerman dan galeri karya), pengunjung memerlukan penanda posisi baca visual (*reading progress indicator*) yang halus untuk memberikan kejelasan konteks posisi halaman tanpa menghalangi konten utama.

---

## Decision

1. **Dedicated Client Component (`ScrollProgress.tsx`)**:
   - Membangun komponen `ScrollProgress` terpisah yang diletakkan pada posisi teratas viewport (`fixed top-0 left-0 right-0 z-[100]`).
   - Menggunakan Framer Motion `useScroll()` untuk membaca progress vertical scroll `scrollYProgress`.
   - Mengaplikasikan `useSpring(scrollYProgress, { stiffness: 300, damping: 30 })` untuk menggerakkan skala horizontal (`scaleX`) dari 0% hingga 100% pada 60/120fps.

2. **Visual Styling Tokens**:
   - Ketebalan bar `3px` dengan gradien warna berpendar (`from-primary via-sky-400 to-indigo-500`).
   - Aura neon `shadow-[0_0_12px_rgba(59,130,246,0.7)]` agar menyatu dengan estetika *glassmorphism* portal.

---

## Consequences

- **Positif**:
  - Pengalaman membaca meningkat drastis dengan indikator progress yang sangat halus.
  - Perhitungan berbasis hardware-accelerated compositor layer tanpa pemicu *layout thrashing*.
- **Batasan**:
  - Berjalan di sisi client layer menggunakan React Client Boundary.
