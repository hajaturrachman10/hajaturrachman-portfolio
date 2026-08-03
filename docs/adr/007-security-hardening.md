# ADR-007: Security Hardening, Operational Safety & Sensitive Action Layer

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Enhancement (PR-006C)

---

## Context
Pada rilis v2.2 Enhancement (PR-006C), sistem memperkuat perlindungan Admin Control Center melalui penataan klasifikasi aksi sensitif berlaput (*Dangerous Action Safety Layer*), pembatalan sesi akibat ketidakaktifan pengguna (*Idle Timeout*), pencatatan metadata login & statistik kegagalan login, serta fasilitas ekspor backup konfigurasi JSON aman.

---

## Decisions & Technical Rationale

1. **Dangerous Action Safety Layer**:
   - **Level 1 (Informational)**: Tanpa dialog konfirmasi (contoh: refresh data statistik).
   - **Level 2 (Confirmation Required)**: Membutuhkan konfirmasi `ConfirmModal` (contoh: Feature Toggle, Reset Stats, Logout Admin).
   - **Level 3 (Confirmation + Re-authentication)**: Membutuhkan dialog konfirmasi + verifikasi kata sandi admin aktif via `ReAuthModal` tanpa menerbitkan cookie baru (contoh: Change Username, Change Password, Restore Snapshot, Revoke Session, Reset Lockout).

2. **Session Activity Timeout (30 Menit Idle)**:
   - Sesi admin akan otomatis di-logout apabila tidak ada interaksi pengguna (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`) selama 30 menit.

3. **Last Login Metadata & Failed Login Counters**:
   - `adminState.json` mencatat `lastLogin` (Waktu, IP, Browser, Remember Mode) dan statistik per hari & total (`failedCountToday`, `successCountToday`, `totalFailed`, `totalSuccess`).

4. **Configuration Export (Future-Ready v2.3 Import)**:
   - Pengunduhan backup data `.json` memuat metadata, versi, checksum SHA-256, strategi password, toggle, dan statistik, dengan mengeluarkan variabel rahasia internal (*Secrets & Tokens Excluded*).

---

## Consequences & Rejected Alternatives

- **Positif**:
  - Mencegah *Human Error* dan pengaksesan tidak sah terhadap operasi berkekuatan tinggi.
  - Memudahkan audit dan monitoring kesehatan keamanan akun admin.
- **Opsi yang Ditolak (Explicitly Rejected)**:
  - *MFA / 2FA / OAuth / Passkeys / Biometric / Cloud Backup / Import Configuration / Encryption-at-Rest / SIEM Integration*: Ditolak dan ditunda ke roadmap v2.3+ untuk mempertahankan efisiensi dan kesederhanaan arsitektur v2.2.
