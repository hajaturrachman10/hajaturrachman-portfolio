# ADR-006: Configuration Versioning, Restore & Safe Configuration Workflow

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Enhancement (PR-006B)

---

## Context
Pada rilis v2.2 Enhancement (PR-006B), sistem membutuhkan mekanisme keselamatan operasional (*Operational Safety, Recoverability, and Auditability*) untuk memastikan seluruh perubahan konfigurasi terikat pada histori versi, dapat dipulihkan (*Restore*), dan dapat diuji tanpa risiko merusak keadaan aktif (*Preview Before Save*).

---

## Decisions & Technical Rationale

1. **Automated Configuration Snapshots (`data/adminSnapshots.json`)**:
   - Setiap perubahan konfigurasi yang berhasil disimpan (Username, Password, Strategy, Feature Toggle, Settings) secara otomatis mengambil snapshot keadaan sebelum perubahan.
   - Maksimal 50 snapshot terbaru dipertahankan (*Auto-Pruning* snapshot tertua).
   - Snapshot mencakup metadata: `version`, `createdAt`, `createdBy`, `message`, `configHash` (SHA-256), dan `state` (`AdminState`).

2. **Isolated Snapshot Repository (`adminSnapshotRepository.ts`)**:
   - Mematuhi prinsip *Depend on Abstractions, Not Implementations*. Repository `adminSnapshotRepository` adalah satu-satunya layer yang berhak membaca dan menulis file `data/adminSnapshots.json`.

3. **Atomic Restore Flow & Session Revocation**:
   - Pemulihan snapshot (`restoreSnapshot`) secara otomatis menaikkan `globalEpoch`, mencatat log audit `SNAPSHOT_RESTORED`, dan membatalkan seluruh sesi publik secara bersamaan.

4. **Preview Before Save**:
   - Simulasi preview konfigurasi (`previewConfiguration`) memvalidasi format input tanpa menulis data ke storage, tanpa membuat snapshot, dan tanpa mengubah state.

---

## Consequences & Rejected Alternatives

- **Positif**:
  - Menjamin *Operational Safety*: Seluruh kesalahan konfigurasi administrator dapat dipulihkan secara instan ke snapshot versi sebelumnya.
  - 100% *Reversible Configuration*.
- **Opsi yang Ditolak (Explicitly Rejected)**:
  - *Git-based Version Control*: Terlalu kompleks untuk runtime Node.js serverless.
  - *Database / Redis / Event Sourcing / WebSockets*: Menambah beban dependensi eksternal, melanggar prinsip *Prefer Simplicity Over Cleverness*.
  - *Infinite History*: Dibatasi 50 snapshot agar ukuran file tetap ringan (`<100KB`).
