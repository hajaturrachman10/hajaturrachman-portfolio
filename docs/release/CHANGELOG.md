# Changelog

All notable changes to the Portfolio project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.0] - 2026-08-08

### Added
- **Floating Toast Notification System**: Added `ToastProvider` & `useToast()` hook with glassmorphic container aligned to `.container-page` bounds, maximum 2 active toasts limit, and independent 3-second auto-dismiss timers (`components/ui/Toast.tsx`).
- **Pixel-Perfect Micro-Tooltips**: Added `<Tooltip>` component with pure CSS centered layout (`left: 50%` + `x: "-50%"`), 300ms hover delay, and instant click auto-dismiss (`components/ui/Tooltip.tsx`).
- **Header Scroll Progress Indicator**: Added `ScrollProgress` component with 3px glowing gradient bar (`from-primary via-sky-400 to-indigo-500`) driven by Framer Motion `useScroll()` and `useSpring()` 60/120fps physics (`components/ui/ScrollProgress.tsx`).
- **Dynamic Multilingual Contact Link Templates**: Added language-responsive pre-filled WhatsApp & Email message templates dynamically switching between ID and DE with `[Nama Anda]` / `[Ihr Name]` placeholders across `Footer`, `ContactSection`, and `AdminLoginView`.
- **Share Modal & QR Code Generator**: Added `ShareModal` component with interactive portfolio link copying, QR code generation (`api.qrserver.com`), and Web Share API integration (`components/modals/ShareModal.tsx`).
- **Anti-Autofill Security Layer**: Added W3C compliant attributes (`autoComplete="new-password"`) and hidden decoy inputs (`fake_user` & `fake_pass`) to suppress Chrome/Google Password Manager popups on access forms (`PasswordModal`, `AdminLoginView`, `ReAuthModal`).
- **Architectural Decision Records**: Added ADR-008 (UI Micro-Interactions & Toast System), ADR-009 (Header Scroll Progress Indicator), and ADR-010 (Bilingual Multilingual Template Engine).

### Changed
- **Mobile Touch Interaction**: Changed touch feedback from persistent `:hover` to native CSS `:active` (`active:border-primary/60`) and added window `scroll`/`touchmove` listeners with `document.activeElement.blur()` to automatically reset tapped buttons on scroll.
- **External Link Security**: Standardized all external communication links to use `target="_blank"` and `rel="noopener noreferrer"`.
- **Magnetic Button Behavior**: Selective removal of `MagneticButton` from public contact cards while preserving magnetic physics on primary submission buttons.
- **Documentation Refactor**: Comprehensive enterprise documentation restructuring into `architecture/`, `reference/`, `adr/`, `release/`, `testing/`, establishing Single Source of Truth maps (`ROUTES.md`, `API_REFERENCE.md`, `FEATURE_REFERENCE.md`, `SECURITY.md`, `PERFORMANCE.md`, `TECH_STACK.md`).

### Fixed
- **Toast Timer Reset Bug**: Fixed Toast component timer dependency bug by passing stable `removeToast(id)` function references, ensuring top toasts expire independently on schedule when new toasts arrive.
- **Framer Motion Transform Overwrite**: Fixed tooltip alignment displacement caused by Framer Motion `transform` style overwrites by explicitly passing `x: "-50%"` inside Framer Motion motion objects.

### Removed
- **Command Palette Feature**: Completely removed Command Palette (Ctrl+K) modal, listeners, and references per user UX simplification request.

---

## [2.2.0] - 2026-08-03

### Added
- **Admin Control Center**: Built hidden `/admin` route featuring 9 operational management tabs (`Overview`, `Messages`, `Feature Toggles`, `Password Strategies`, `Config History`, `Audit Log`, `System Health`, `Security`, `Settings`).
- **Result Pattern Service Layer**: Implemented `ServiceResult<T>` envelope patterns across all server services (`services/admin/*`).
- **HMAC-SHA256 Session Cookies**: Added signed, tampered-proof `admin_session` cookie authentication with 30-minute idle session timeout.
- **Synchronized Epoch Revocation**: Implemented `globalEpoch` revocation mechanism for instant global public session invalidation on feature protection toggle updates.
- **Configurable Password Strategy Engine**: Implemented 6 password strategy evaluation rules (`STATIC`, `YEAR_RANGE`, `MULTIPLE`, `PREFIX`, `SUFFIX`, `REGEX`) with Live Preview Validator.
- **Configuration Versioning & Restore**: Implemented snapshot storage (`data/adminSnapshots.json`), atomic snapshot restoration, and JSON backup export.
- **Dangerous Action Safety Layer**: Added Level 3 Re-Authentication (`ReAuthModal`) for destructive operations.

---

## [2.1.0] - 2026-07-29

### Added
- **Design System Baseline v2.1**: Established core CSS design tokens, HSL color variables, glassmorphic cards, and dark/light mode engine.
- **Bilingual Internationalization**: Added `LanguageContext` supporting live Indonesian (`id`) and German (`de`) content switching.
- **Protected Resource Viewing**: Added password-gated access modals for CV PDF viewing and Private Vault media assets.
