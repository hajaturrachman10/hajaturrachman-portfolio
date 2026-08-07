# ADR-010: Bilingual Multilingual Template Engine & Contact Routing

- **Status**: Approved
- **Date**: 2026-08-08
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.3 Internationalization & Lead Generation

---

## Context

Portofolio ini menargetkan dua audiens utama: profesional/instansi di Indonesia dan agensi/rumah sakit/klinik di Jerman (Ausbildung Pflegefachmann). Tautan komunikasi eksternal (WhatsApp & Email) membutuhkan mekanisme templat pesan otomatis yang menyesuaikan bahasa aktif pengguna saat itu, agar pesan awal pengirim terstruktur dengan jelas dan mudah dikenali oleh pemilik portofolio.

---

## Decision

1. **Dynamic Language-Aware Message Templates**:
   - Tautan kontak di `AdminLoginView`, `ContactSection`, dan `Footer` membaca state `language` dari `LanguageContext`.
   - Templat pesan WhatsApp & Email beralih otomatis antara bahasa Indonesia (`id`) dan bahasa Jerman (`de`).
   - Menyertakan simbol placeholder eksplisit `[Nama Anda]` (ID) dan `[Ihr Name]` (DE) pada pesan awal.

2. **Standardisasi Link Target**:
   - Seluruh tautan komunikasi eksternal diatur menggunakan `target="_blank"` dan `rel="noopener noreferrer"` untuk keamanan dan kenyamanan browsing pengguna.

---

## Consequences

- **Positif**:
  - Konversi komunikasi dari recruiter Jerman meningkat karena kemudahan pengiriman pesan berbahasa Jerman B2 secara instan.
  - Aman dari potensi serangan *tabnabbing* berkat penggunaan `rel="noopener noreferrer"`.
- **Batasan**:
  - Membutuhkan penataan templat pesan pada file data `data/site.ts` secara tersinkronisasi.
