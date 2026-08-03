# Manual Test Checklist — Portfolio v2.2 (RC1)

Dokumen ini merupakan **daftar periksa pengujian manual (Manual Test Checklist)** untuk memverifikasi kualitas dan perilaku antarmuka pengguna, keamanan, serta fitur-fitur **Portfolio v2.2 Admin Control Center** sebelum rilis ke lingkungan produksi.

---

## 1. Authentication & Session Management

- [ ] **1.1 Akses Rute Tersembunyi `/admin`**
  - Ketik `http://localhost:3000/admin` pada browser.
  - *Ekspektasi*: Tampilan form login admin muncul cleanly tanpa Navbar, Footer, atau elemen navigasi publik.
- [ ] **1.2 Autentikasi Gagal (Salah Password / Username)**
  - Masukkan username/password acak yang salah.
  - *Ekspektasi*: Muncul pesan kesalahan merah, form bergetar (*shake animation*), dan cookie admin tidak terpasang.
- [ ] **1.3 Autentikasi Berhasil (Case-Insensitive Username & Case-Sensitive Password)**
  - Masukkan username `hajaturrachman10` atau `Hajaturrachman10` dan password `Xyzordie67@`.
  - *Ekspektasi*: UI beralih instan ke Dashboard Admin, cookie `admin_session` (`HttpOnly; SameSite=Strict`) terpasang.
- [ ] **1.4 Remember Login (30 Hari)**
  - Centang opsi "Ingat Saya (30 Hari)" saat login.
  - *Ekspektasi*: Tanggal kadaluarsa cookie di-set 30 hari ke depan.
- [ ] **1.5 Logout Admin**
  - Klik tombol "Logout" di header dashboard dan konfirmasi via modal.
  - *Ekspektasi*: Cookie `admin_session` dibersihkan, tampilan kembali ke Login View.
- [ ] **1.6 Session Inactivity Timeout (30 Menit Idle)**
  - Biarkan browser tanpa interaksi mouse/keyboard selama 30 menit.
  - *Ekspektasi*: Sesi otomatis di-logout dan tampilan beralih ke form login.

---

## 2. Lockout & Brute Force Protection

- [ ] **2.1 Percobaan Login Salah (Batas 5x)**
  - Masukkan password salah secara berturut-turut sebanyak 5 kali dari IP yang sama.
  - *Ekspektasi*: Pada percobaan ke-5, IP dibekukan selama 15 menit (HTTP 429 Too Many Requests).
- [ ] **2.2 Lockout Reset oleh Admin (Level 3 Re-Auth)**
  - Pada tab *Security*, klik tombol "Reset Lockout IP".
  - *Ekspektasi*: ReAuthModal muncul meminta password admin. Setelah diisi benar, pembekuan IP rate-limit di-reset.

---

## 3. Feature Toggle Engine & Public Live Synchronization

- [ ] **3.1 Toggle Off (UNPROTECTED State)**
  - Pada tab *Features*, ubah toggle `CV`, `Private Vault`, atau `ECL Material` menjadi **OFF**.
  - Buka tab publik baru di `/journey`, `/private`, atau `/ecl-b2`.
  - *Ekspektasi*: Halaman publik langsung terbuka tanpa meminta kata sandi (*Unprotected Access*).
- [ ] **3.2 Toggle On (PROTECTED State) & Live Sync**
  - Buka halaman terproteksi publik yang sedang tidak terkunci.
  - Di tab Admin Control Center, ubah toggle fitur tersebut menjadi **ON (PROTECTED)**.
  - Kembali ke tab publik dan lakukan interaksi / navigasi.
  - *Ekspektasi*: Pengguna publik seketika kehilangan akses (Epoch Revocation invalidates token) dan tampilan publik kembali terkunci (*Auto-Locked View*).

---

## 4. Configurable Password Strategy Engine & Preview Validator

- [ ] **4.1 Konfigurasi Strategi Validasi (Tab Settings)**
  - Pilih resource `ECL Material` dan pilih strategi `YEAR_RANGE` (Base `10juli`, Range `2006` - `2026`).
  - Uji via **Preview Validator**:
    - Input `10juli2018` ➔ *Ekspektasi*: `✅ VALID`.
    - Input `11juli2018` ➔ *Ekspektasi*: `❌ INVALID`.
- [ ] **4.2 Save Strategy Config**
  - Klik "Simpan Konfigurasi Strategi".
  - Buka rute publik `/ecl-b2` dan masukkan password `10juli2018`.
  - *Ekspektasi*: Akses ECL berhasil terbuka (*Unlocked*).

---

## 5. Configuration Versioning & Restore (Tab Config History)

- [ ] **5.1 Pembuatan Snapshot Otomatis**
  - Ubah status toggle atau password strategy.
  - Buka tab *Config History*.
  - *Ekspektasi*: Snapshot baru dengan nomor versi berurutan (v1, v2, ...) tercatat dengan timestamp dan SHA-256 hash.
- [ ] **5.2 Restore Snapshot (Level 3 Re-Auth)**
  - Klik tombol "Restore" pada snapshot versi sebelumnya.
  - *Ekspektasi*: ReAuthModal muncul meminta password admin. Setelah dikonfirmasi, keadaan sistem dipulihkan ke versi snapshot tersebut.

---

## 6. UI Baseline Parity, Responsive, & Accessibility

- [ ] **6.1 Visual Baseline Parity v2.1**
  - Buka seluruh rute publik (`/`, `/journey`, `/projects`, `/gallery`, `/private`, `/ecl-b2`, `/_not-found`).
  - *Ekspektasi*: Tampilan visual, warna, animasi, tipografi, dan layout publik 100% identik dengan baseline v2.1 (Zero Visual Regression).
- [ ] **6.2 Responsivitas (Mobile & Desktop)**
  - Uji tampilan dashboard pada lebar layar 375px (Mobile), 768px (Tablet), dan 1440px (Desktop).
  - *Ekspektasi*: Top Navigation Tabs dapat di-scroll secara mulus di mobile, layout kartu menyesuaikan secara responsif.
- [ ] **6.3 Aksesibilitas (Keyboard Navigation & ARIA)**
  - Gunakan tombol `Tab`, `Shift+Tab`, `Enter`, dan `Space` untuk menavigasi form dan tombol.
  - Tekan `Escape` saat dialog modal terbuka.
  - *Ekspektasi*: Outlines penanda fokus (`.focus-ring`) terlihat jelas, modal dapat ditutup dengan tombol `Escape`.
