# Release Notes — Portfolio v2.3.0

- **Version**: `v2.3.0`
- **Release Date**: 2026-08-08
- **Release Status**: `RELEASE CANDIDATE (RC1)`
- **Architectural Scope**: User Experience Micro-Interactions, Toast Notification System, Scroll Progress Indicator, Anti-Autofill Security, & Enterprise Documentation Refactor.

---

## 🌟 Highlights & New Features

### 1. 🔔 Floating Toast Notification System
Introduces a production-grade floating notification system (`Toast.tsx`). Toasts render inside a glassmorphic container aligned to site layout boundaries (`.container-page`), supporting up to 2 simultaneous toasts with independent 3-second auto-dismiss timers and Framer Motion spring exit transitions.

### 2. 💬 Pixel-Perfect Centered Tooltips
Adds a micro-tooltip component (`Tooltip.tsx`) providing instant context for action buttons (`Bahasa`, `Bagikan`, `Tema`). Features a 300ms intentional hover delay, pure CSS centering (`left: 50%` + `x: "-50%"`), and instant auto-dismiss on click/tap.

### 3. 📊 Header Scroll Progress Indicator
Adds a glowing 3px progress bar (`ScrollProgress.tsx`) fixed at the screen top (`z-[100]`), animating from 0% to 100% reading progress at 60/120fps using Framer Motion `useScroll()` & `useSpring()` physics.

### 4. 📱 Mobile Touch UX & Auto-Reset on Scroll
Resolves WebKit/Blink mobile engine "sticky touch hover" issues by utilizing CSS native `:active` state classes and window `scroll`/`touchmove` event listeners that automatically blur active elements when scrolling starts.

### 5. 🇩🇪 Bilingual WhatsApp & Email Pre-filled Message Templates
Upgrades all communication links across `Footer`, `ContactSection`, and `AdminLoginView` to dynamically pre-fill localized message templates matching active site language (ID 🇮🇩 ↔️ DE 🇩🇪) with `[Nama Anda]` / `[Ihr Name]` placeholders.

### 6. 🔒 Anti-Autofill Password Manager Layer
Adds W3C compliant attributes (`autoComplete="new-password"`) and hidden decoy input elements (`fake_user` & `fake_pass`) to suppress intrusive browser password manager popups on access forms.

---

## 📚 Documentation Refactor Summary

Restructured application engineering documentation into an enterprise-grade taxonomy:
- `docs/architecture/`: Architecture philosophy, system overview, and directory maps.
- `docs/reference/`: Single Source of Truth maps (`ROUTES.md`, `API_REFERENCE.md`, `FEATURE_REFERENCE.md`, `SECURITY.md`, `PERFORMANCE.md`, `TECH_STACK.md`).
- `docs/adr/`: Architecture Decision Records (ADR 001 through ADR 010).
- `docs/release/`: Enterprise CHANGELOG, Release Checklists, & Release Notes.
- `docs/testing/`: Manual Testing & Regression Testing guides.

For full version history, see [CHANGELOG.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/release/CHANGELOG.md).
