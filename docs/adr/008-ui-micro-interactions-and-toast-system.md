# ADR-008: UI Micro-Interactions, Floating Toast System & Centered Tooltips

- **Status**: Approved
- **Date**: 2026-08-08
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.3 User Experience & Interaction Architecture

---

## Context

Pada pengembangan rilis v2.3, sistem membutuhkan mekanisme balasan visual (*feedback*) yang instan, elegan, dan non-intrusif saat pengguna melakukan aksi (seperti pengisian form kontak, penyalinan URL, pengubahan bahasa, atau pengubahan mode warna). Diperlukan sistem notifikasi melayang (Toast) dan petunjuk hover (Tooltip) yang konsisten di seluruh aplikasi tanpa menimbulkan hambatan tata letak (*layout shifting* atau *boundary clipping*).

---

## Decision

1. **Floating Toast System (`Toast.tsx`)**:
   - Membangun `ToastProvider` & `useToast()` hook dengan pemicu kustom event global (`hajat_custom_toast_event`).
   - Kontainer Toast dibungkus di dalam `.container-page` di bagian kanan bawah untuk menyelaraskan batas visual dengan Navbar pada monitor ultra-wide.
   - Pembatasan maksimal 2 toast simultan dengan animasi `AnimatePresence mode="popLayout"`.
   - **Independent Timer**: Setiap instans Toast mengeksekusi timer `setTimeout` 3-detiknya secara mandiri menggunakan dependensi stabil `removeToast(id)` agar timer suatu toast tidak ter-reset ketika toast baru muncul.

2. **Pixel-Perfect Micro-Tooltips (`Tooltip.tsx`)**:
   - Komponen Tooltip menggunakan CSS murni `relative inline-flex items-center justify-center` pada pembungkus dan `absolute top-[calc(100%+8px)] left-1/2` dengan `x: "-50%"` pada Framer Motion animation bounds.
   - Menambahkan jeda hover *intentional* 300ms dan handler `onClickCapture` & `onPointerDown` untuk menghapus tooltip secara instan begitu tombol diklik (*auto-dismiss*).

3. **Mobile Touch UX & Auto-Reset on Scroll**:
   - Menggunakan kelas CSS native `:active` (`active:border-primary/60`, `group-active:text-primary`) untuk respon visual biru saat di-tap di HP.
   - Memasang pendeteksi `scroll` dan `touchmove` pada Navbar untuk melepaskan fokus (`document.activeElement.blur()`) dan menerapkan kelas temporary `body.is-scrolling` (`pointer-events: none`) sehingga tombol otomatis kembali ke warna biasa saat di-scroll.

---

## Consequences

- **Positif**:
  - Respon visual instan di seluruh perangkat (Desktop & Mobile) tanpa efek rintangan layout.
  - Timer notifikasi 100% akurat dan independen.
  - Pengalaman touch di HP bebas dari bug warna menempel (*sticky hover/focus*).
- **Batasan**:
  - Mengandalkan Framer Motion `AnimatePresence` untuk transisi exit pada client layer.
