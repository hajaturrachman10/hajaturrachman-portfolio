# ADR-001: Result Pattern & HMAC Signed Cookies for Admin Authentication

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Admin Control Center Authentication

---

## Context
Pada PR-002 (Admin Authentication & Session Management), sistem membutuhkan fondasi autentikasi administrator yang aman, modular, *type-safe*, dan tidak menciptakan *circular dependency*. Diperlukan pola return nilai service dan strategi penyimpanan cookie yang konsisten di seluruh lapisan aplikasi.

---

## Decision

1. **Service Layer Result Pattern**:
   - Seluruh fungsi pada `adminAuthService` dan `adminService` mengembalikan tipe data `ServiceResult<T>` secara eksplisit (`{ success: true, data: T }` atau `{ success: false, error: ServiceError }`).
   - *Alasan*: Menghindari melempar exception/error acak (*uncaught exceptions*) pada runtime serverless Next.js dan menjamin penanganan error yang 100% *type-safe* di API layer adapter.

2. **HMAC-SHA256 Signed Session Cookies**:
   - Cookie `admin_session` menggunakan payload JSON terenkode `base64url` yang ditandatangani oleh signature HMAC-SHA256 dengan perbandingan waktu konstan (*constant-time comparison* via `timingSafeCompare`).
   - Cookie dikonfigurasikan dengan flag `HttpOnly`, `Secure` (pada lingkungan produksi), `SameSite=Strict`, dan `Path=/`.
   - *Alasan*: Menjamin cookie tidak dapat dimanipulasi di sisi klien (*tamper-proof*) tanpa memerlukan database sesi eksternal.

3. **Global Epoch Revocation**:
   - Pembatalan sesi (*Session Revocation*) dilakukan dengan membandingkan `globalEpoch` pada token sesi terhadap `globalEpoch` di `data/adminState.json`.
   - *Alasan*: Mengizinkan pembatalan sesi instan (*instant global logout*) tanpa membutuhkan koneksi WebSockets atau memori terpusat Redis.

---

## Consequences

- **Positif**:
  - Codebase sangat rapi, tidak ada melempar objek error acak, mudah dites.
  - Sangat aman dari serangan Brute-Force, CSRF, XSS Cookie Theft, dan Timing Attacks.
  - Nol ketergantungan pada dependensi npm pihak ketiga baru.
- **Batasan**:
  - Jika `ADMIN_SESSION_SECRET` diubah di server, seluruh sesi aktif akan otomatis dibatalkan.
