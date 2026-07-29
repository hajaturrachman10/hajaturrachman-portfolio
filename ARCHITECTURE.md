# Portfolio v2.1 — Architecture & Developer Guide

Dokumen ini merupakan **panduan arsitektur dan peta navigasi resmi** untuk pengembangan proyek **Portfolio v2.1**. Dokumen ini dirancang khusus agar mudah dipahami oleh developer baru (*Developer Experience / DX First*).

---

## 1. Project Philosophy

Pengembangan proyek ini dipandu oleh 5 prinsip utama:

1. **Minimum Change, Maximum Clarity**: Solusi yang lebih sederhana selalu diprioritaskan dibanding abstraksi yang rumit. Lebih baik mempertahankan file berukuran sedang yang alur kodenya linier daripada memecahnya menjadi belasan mikro-file yang membingungkan navigasi.
2. **Evidence First**: Setiap optimisasi, refactoring, atau perbaikan bug **wajib diawali oleh bukti nyata**, bukan sekadar asumsi atau *best practice* spekulatif.
3. **No Speculative Refactoring**: Tidak ada pemecahan atau pengubahan kode jika kode saat ini sudah berjalan aman, rapi, dan efisien.
4. **Behavior & Visual Preservation**: Hasil render browser, antarmuka pengguna (UI), tata letak (layout), animasi, dan alur aplikasi wajib dipertahankan 100% tanpa regresi.
5. **Natural Architecture**: Susunan direktori dan penamaan file diatur secara alami sehingga mudah ditebak tanpa perlu membuka terlalu banyak tab file.

---

## 2. Project Structure

Tanggung jawab dari setiap direktori utama dalam proyek:

```
d:\Hajat\hajaturrachman-portfolio\
├── app/                  # Next.js App Router (Halaman Rute & Endpoint API Server-side)
├── components/           # Elemen UI Shared, Layar Layout, Modals, Sections, & Context Providers
│   ├── layout/           # Header Navbar, Footer, SectionHeader, & PageTransition
│   ├── modals/           # Modal interaktif (PasswordModal, ConfirmModal, LocationConfirmModal)
│   ├── providers/        # LanguageContext, Providers, ScrollRestoration, & PageRestoreOverlay
│   ├── sections/         # Blok section halaman utama (Hero, About, Projects, Gallery, dll.)
│   └── ui/               # Komponen UI atomik (MagneticButton, Reveal, Typewriter, ThemeToggle)
├── features/             # Fitur domain mandiri yang terisolasi (cv, ecl, vault)
│   ├── cv/               # Proteksi & Modal Viewer PDF CV
│   ├── ecl/              # Materi & Audio Player German B2
│   └── vault/            # Ruang Personal Terproteksi & Memory Carousel
├── data/                 # Konten statis portfolio, bahasa (ID/DE), & skema konfigurasi situs
├── services/             # Lapisan logika bisnis & verifikasi server-side (auth, cv, vault, contact)
├── hooks/                # Custom React hooks (useAudioPlayer, useAuthStatus, useModalState)
├── lib/                  # Utility helper (scroll lock, security, supabase, cn utility)
└── public/               # Aset publik statis (gambar, SVG, & dokumen PDF CV)
```

---

## 3. Data Flow

Alur data di dalam aplikasi bergerak secara konsisten dari lapisan data hingga ke antarmuka pengguna:

```mermaid
flowchart LR
    A["data/ (Statis / Config)"] --> B["services/ (Business Logic & Security)"]
    B --> C["features/ (Domain Isolation)"]
    C --> D["components/ (UI & Layout)"]
    D --> E["app/ (Next.js Page Routes)"]
```

1. **`data/`**: Menyimpan data statis, teks konfigurasi situs, dan konten multibahasa (ID/DE).
2. **`services/`**: Mengeksekusi verifikasi token, pembacaan file terproteksi, serta validasi form server-side.
3. **`features/`**: Mengelompokkan komponen UI, state lokal, dan interaksi yang spesifik pada satu domain tertentu.
4. **`components/`**: Menyediakan komponen UI atomik, section layout, dan dialog modal yang reusable.
5. **`app/`**: Merender rute halaman utama Next.js (`/`, `/journey`, `/projects`, `/gallery`, `/private`, `/ecl-b2`) serta endpoint API server (`/api/...`).

---

## 4. Rendering Flow

1. **Server Rendering & Static Generation**: Rute halaman utama di-prerender secara statis oleh Next.js untuk mendapatkan waktu muat TTFB `0 ms`.
2. **Client Component Boundaries**: Komponen interaktif (seperti `ThemeToggle`, `<MagneticButton>`, `PasswordModal`) ditandai dengan `"use client"` pada batas terluar.
3. **Route Transitions**: Setiap perpindahan rute dibungkus oleh `PageTransition` menggunakan `AnimatePresence` untuk memberikan animasi fade/slide yang halus.
4. **State Isolation**: State aplikasi terisolasi pada level komponen lokal (misal: state kata sandi di `PasswordModal`, state audio player di `ECLMaterialSection`) sehingga re-render tidak memicu rekonsiliasi global.

---

## 5. Adding New Feature Standard

Langkah standar bagi developer ketika hendak membuat fitur baru:

```
[Definisikan Data di data/] 
         ↓
[Buat Business Logic di services/] 
         ↓
[Buat Feature Component di features/fitur-baru/] 
         ↓
[Buat Reusable UI di components/ jika dipanggil di banyak tempat] 
         ↓
[Hubungkan ke Page Rute di app/]
```

---

## 6. Developer Rules

1. **Jangan Membikin Duplicate Component**: Periksa `components/ui/` dan `components/modals/` sebelum membuat komponen baru.
2. **Jangan Bypass Design System**: Selalu gunakan token Tailwind yang sudah ada (`.premium-card`, `.button-primary`, `.input`, `.section-space`, `.container-page`).
3. **Jangan Hardcode Color Tokens**: Gunakan variabel warna CSS yang mendukung Mode Gelap & Mode Terang (`rgb(var(--color-primary))`, `rgb(var(--color-surface))`).
4. **Jangan Menambah Dependensi Tanpa Alasan**: Evaluasi apakah fitur dapat diselesaikan dengan kode yang ada sebelum menginstall paket `npm` baru.
5. **Jangan Refactor Tanpa Bukti**: Setiap perbaikan wajib diawali bukti masalah nyata (*Evidence First*).
