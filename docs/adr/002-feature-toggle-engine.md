# ADR-002: Feature Toggle Engine & Public Epoch Synchronization

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Admin Control Center Feature Toggle & Public Live Sync

---

## Context
Pada PR-003 (Feature Toggle Engine & Public Live Synchronization), sistem membutuhkan mesin pengatur status proteksi konten (`CV`, `Private Vault`, `ECL Material`) antara dua kondisi: `PROTECTED` (ON) dan `UNPROTECTED` (OFF). Persyaratan utama adalah ketika proteksi diubah menjadi ON, seluruh sesi publik aktif harus secara otomatis kehilangan akses tanpa memerlukan ketergantungan pada WebSockets atau polling berlebihan.

---

## Decisions & Technical Rationale

1. **Pemupukan Status Proteksi (Single Source of Truth)**:
   - Seluruh status proteksi disimpan dan dibaca secara eksklusif dari `adminRepository` (`data/adminState.json`).
   - *Alasan*: Menjamin tidak ada *duplicate state* atau kebocoran logika di UI, API, maupun middleware.

2. **Lapisan Publik Tanpa State Permanen (Stateless Public Layer)**:
   - Lapisan validasi akses publik (`verifySessionToken`) secara otomatis membaca status toggle terbaru pada setiap permintaan API.
   - Jika status toggle `UNPROTECTED` (OFF), akses langsung diberikan tanpa memerlukan kata sandi.
   - *Alasan*: Menghindari ketergantungan sesi publik pada state lokal browser.

3. **Event-Driven State Changes & Epoch Revocation (`globalEpoch`)**:
   - Ketika status proteksi diubah dari `UNPROTECTED` (OFF) ke `PROTECTED` (ON), `adminToggleService` secara otomatis memperbarui timestamp `globalEpoch = Date.now()`.
   - Permintaan API publik berikutnya yang membawa token bertanggal sebelum `globalEpoch` akan secara otomatis ditolak dengan HTTP 401 Unauthorized (mengarah pada penguncian UI publik secara instan).
   - *Alasan Pembatalan WebSocket*: WebSockets membutuhkan koneksi *long-polling* berjangka panjang yang tidak cocok dengan arsitektur Serverless Vercel dan menambah overhead memori. Synchronized Epoch Validation mencapai hasil instan dengan `0ms` biaya infrastruktur tambahan.

---

## Consequences

- **Positif**:
  - Arsitektur sangat bersih, hemat daya serverless, dan 100% *type-safe*.
  - Sesi publik langsung tidak berlaku begitu proteksi di-aktifkan kembali.
  - Sangat mudah diuji dan dikembangkan untuk fitur-fitur baru di masa depan.
- **Batasan**:
  - Pengguna publik yang berada di halaman tanpa melakukan interaksi API berikutnya tidak akan mengetahui perubahan hingga request API berikutnya terjadi (misal: navigasi atau unduh file).
