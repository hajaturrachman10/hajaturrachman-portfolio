# ADR-004: Admin Control Center UI Architecture

- **Status**: Approved
- **Date**: 2026-07-30
- **Author**: Hajaturrachman Architecture Team
- **Scope**: Portfolio v2.2 Admin Control Center Presentation Layer

---

## Context
Pada PR-005 (Admin Control Center UI), sistem membutuhkan antarmuka kendali internal terisolasi pada rute tersembunyi `/admin`. Persyaratan utama menetapkan **UI Reads State. Services Own Behavior** di mana antarmuka pengguna hanya bertindak sebagai *Presentation Layer* yang merefleksikan keadaan sistem dan mengirimkan intent ke Service Layer, tanpa menggandakan *Business Rules* atau membuat bahasa desain baru.

---

## Decisions & Technical Rationale

1. **Paritas 100% Design System v2.1 Baseline**:
   - Seluruh komponen UI Admin menggunakan token CSS baku (`.premium-card`, `.soft-card`, `.glass`, `<MagneticButton>`, `<Reveal>`, `.focus-ring`, `ConfirmModal`).
   - *Alasan*: Menjamin bahasa visual Admin Control Center 100% konsisten dengan situs utama tanpa menimbulkan *visual mismatch* atau kebingungan antarmuka.

2. **Top Navigation Tabs (No Sidebar)**:
   - Antarmuka dashboard menggunakan sistem tab horizontal (`Overview`, `Features`, `Security`, `Statistics`, `Settings`, `Health`, `Audit`).
   - *Alasan*: Menghindari tata letak khusus sidebar yang rumit di mobile. Grid responsif 12/8/4 yang sudah ada dipakai penuh di seluruh perangkat (Desktop, Tablet, Mobile).

3. **Restriksi Destruktif Berbasis ConfirmModal**:
   - Seluruh tindakan destruktif (Reset Lockouts, Pembatalan Sesi Global, Perubahan Username/Password Admin) wajib melewati dialog konfirmasi `ConfirmModal`.
   - *Alasan*: Mencegah eksekusi tindakan merusak secara tidak sengaja (*Accidental Trigger Protection*).

---

## Consequences

- **Positif**:
  - Antarmuka terlihat sangat premium, cepat, dan 100% selaras dengan Design System Baseline v2.1.
  - Aksesibilitas terjamin (`Tab` Order, `Escape` key to close modal, Focus visible, ARIA dialog, Reduced Motion support).
  - Tersembunyi penuh dari publik tanpa link di Navbar, Footer, atau Sitemap.
- **Batasan**:
  - Pengguna wajib mengetik rute `/admin` secara langsung pada bilah alamat browser.
