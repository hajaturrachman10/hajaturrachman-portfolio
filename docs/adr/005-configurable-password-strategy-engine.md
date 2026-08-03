# ADR-005: Configurable Password Strategy Engine & Case Rules

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Enhancement (PR-006A)

---

## Context
Pada pengembangan v2.2 Enhancement (PR-006A), sistem membutuhkan mekanisme pengelolaan kata sandi resource terproteksi (`CV`, `Private Vault`, `ECL Material`) dan kredensial admin yang dinamis tanpa memerlukan perubahan kode (*zero-code configuration change*). Diperlukan mesin strategi password universal yang mematuhi prinsip *Depend on Abstractions, Not Implementations*.

---

## Decisions & Technical Rationale

1. **Aturan Case Normalization (Admin Credentials)**:
   - **Admin Username**: Bersifat **Case-Insensitive** via `normalize(username)` (`username.trim().toLowerCase()`). Contoh: `Hajaturrachman10`, `hajaturrachman10`, dan `HAJATURRACHMAN10` diakui sama.
   - **Admin Password**: Bersifat **Case-Sensitive Exact Match** menggunakan `timingSafeCompare` (Default: `Xyzordie67@`).

2. **Universal Password Strategy Engine (`passwordEngine.ts`)**:
   - Seluruh resource terproteksi mengeksekusi validasi password via antarmuka universal `evaluatePasswordStrategy(inputPassword, strategyConfig)`.
   - Strategi yang didukung:
     - `STATIC`: Perbandingan kata sandi persis (*Exact Match*).
     - `YEAR_RANGE`: Validasi kombinasi string dasar + rentang tahun (contoh: `10juli2006` s/d `10juli2026`).
     - `MULTIPLE`: Validasi daftar beberapa kata sandi valid.
     - `PREFIX`: Validasi awalan kata sandi (`starts_with`).
     - `SUFFIX`: Validasi akhiran kata sandi (`ends_with`).
     - `REGEX`: Validasi ekspresi reguler dinamis (*Regular Expression*).

3. **Interactive Preview Validator**:
   - Menyediakan fitur penguji aturan langsung (`[ Validate ]`) di Admin Settings UI agar administrator dapat mengetes keabsahan aturan kata sandi sebelum menyimpannya ke storage.

---

## Consequences

- **Positif**:
  - Penambahan fitur terproteksi baru di masa depan (v2.3+ seperti Gallery / Project / Journey Manager) dapat langsung menggunakan strategi password tanpa mengubah 1 baris pun kode engine.
  - Mencegah kesalahan konfigurasi kata sandi melalui pengujian instan di UI.
- **Batasan**:
  - Penggunaan strategi `REGEX` yang terlalu kompleks harus divalidasi sintaksnya di server agar tidak menyebabkan runtime error.
