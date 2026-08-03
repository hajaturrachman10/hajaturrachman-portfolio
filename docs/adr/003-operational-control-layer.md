# ADR-003: Operational Control Layer Architecture

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Admin Control Center Operational Control Services

---

## Context
Pada PR-004 (Operational Control Layer), sistem membutuhkan abstraksi operasional yang lengkap untuk mengelola pembekuan IP (*Lockout Management*), pembatalan sesi (*Session Management*), kalkulasi statistik (*Statistics Service*), pengaturan administrator (*Settings Service*), serta pemeriksaan kesehatan sistem (*Health Check Service*). 

Prinsip arsitektur menetapkan **Operational Logic Lives in Services** di mana controllers/API routes hanya bertindak sebagai *Thin Adapters* dan `adminRepository` berfungsi sebagai *Single Source of Truth*.

---

## Decisions & Technical Rationale

1. **Pemisahan Modul Service Operasional (Thin Controllers, Fat Services)**:
   - Seluruh logika operasional dipisahkan menjadi modul service independen: `adminLockoutService`, `adminSessionService`, `adminStatsService`, `adminSettingsService`, `adminHealthService`.
   - Controller HTTP di `app/api/admin/*` bertindak murni sebagai adapter yang meneruskan permintaan ke Service Layer dan mengembalikan respons HTTP.
   - *Alasan*: Menjamin bahwa ketika UI Admin Dashboard dibangun pada PR-005, UI tersebut dapat langsung memanggil service atau API adapter tanpa perlu menduplikasi business rules.

2. **Repository Sebagai Single Source of Truth**:
   - Seluruh pembacaan dan pembaruan data keadaan (`auth`, `toggles`, `globalEpoch`, `stats`) secara ketat diwajibkan melewati `adminRepository`.
   - *Alasan*: Mencegah konflik keadaan (*race conditions*) atau pembaruan file JSON yang terpisah-pisah.

3. **Logika Health Check Tanpa Dependensi Luar**:
   - `adminHealthService` melakukan pemeriksaan keterbacaan, keterulisan storage, validitas kredensial, tersedianya rahasia cookie, dan versi runtime secara native.
   - *Alasan*: Memberikan laporan kesehatan sistem (*system health report*) secara instan dengan `0ms` latensi tanpa perlu memasang library monitoring eksternal.

---

## Consequences

- **Positif**:
  - Arsitektur operasional sangat rapi, teruji, dan 100% konsisten menggunakan Result Pattern `ServiceResult<T>`.
  - API adapters sangat tipis, mudah dipelihara, dan bebas dari business logic yang berserakan.
  - Sangat siap untuk dikoneksikan ke antarmuka visual Admin Dashboard pada PR-005.
- **Batasan**:
  - Pengaturan *Lockout Rate Limit* pada level memori ter-reset saat server mengalami restart penuh. (Bilah pembatalan global `globalEpoch` tetap persisten di storage JSON).
