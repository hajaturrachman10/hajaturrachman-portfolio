# Single Source of Truth: Feature Specifications

This document serves as the Single Source of Truth (SSOT) for all functional features across the Portfolio platform.

---

## 1. Public Portfolio Features

### A. Multilingual Engine (Bilingual ID 🇮🇩 ↔️ DE 🇩🇪)
- **Scope**: Entire public site (`Navbar`, `Footer`, `HeroSection`, `ContactSection`, `ECLMaterialSection`, `PasswordModal`, `UnavailableCard`).
- **Behavior**: Seamless switching between Indonesian (`id`) and German (`de`).
- **Pre-filled Message Templates**: Contact links (WhatsApp & Email) automatically pre-fill localized message templates incorporating `[Nama Anda]` (ID) or `[Ihr Name]` (DE) placeholders.

### B. Floating Toast Notification System (`Toast.tsx`)
- **Visual Design**: Glassmorphic floating toast notification container positioned at the bottom-right of the viewport.
- **Boundary Constraint**: Wrapped inside `.container-page` to align with main site layout boundaries on ultra-wide screens.
- **Concurrency Limit**: Maximum 2 active toasts simultaneously on screen.
- **Independent Auto-Dismiss**: Each toast instance executes its own stable 3-second `setTimeout` countdown. When its duration finishes, the specific toast exits smoothly without resetting or waiting for other toasts.

### C. Pixel-Perfect Micro-Tooltips (`Tooltip.tsx`)
- **Positioning**: Pure CSS centered positioning (`left: 50%` + `x: "-50%"` in Framer Motion animation bounds) directly under action buttons (`Bahasa`, `Bagikan`, `Tema`).
- **Interaction**:
  - `300ms` intentional hover delay to prevent accidental popups during quick cursor sweeps.
  - **Instant Click Auto-Dismiss**: Tooltip immediately disappears on button click/tap.

### D. Mobile Touch UX & Auto-Reset on Scroll
- **Tap Feedback**: Uses CSS native `:active` (`active:border-primary/60`, `group-active:text-primary`) for touch-screen visual feedback.
- **Auto-Reset on Scroll**: Attaches `scroll` and `touchmove` event listeners to automatically invoke `document.activeElement.blur()` and apply temporary `.is-scrolling` pointer-events suppression, resetting tapped buttons to default gray/neutral state when scrolling starts.

### E. Header Scroll Progress Indicator (`ScrollProgress.tsx`)
- **Design**: 3px glowing gradient line (`from-primary via-sky-400 to-indigo-500`) fixed at the screen top (`z-[100]`).
- **Physics**: Real-time 60/120fps progress fill (0% to 100%) driven by Framer Motion `useScroll()` & `useSpring()`.

---

## 2. Admin Control Center Features

### A. Dashboard Management Tabs
The hidden `/admin` route provides 9 integrated operational tabs:
1. **Overview Tab**: Real-time traffic, protection states, and system health status.
2. **Messages Tab**: Interactive inbox for reading, deleting, and managing visitor contact submissions.
3. **Feature Toggles Tab**: Real-time protection controls for gated resources (`CV`, `Vault`, `ECL`).
4. **Password Strategies Tab**: Multi-strategy rule editor with Live Preview Validator.
5. **Config History Tab**: Operational snapshots list, preview, and atomic restoration.
6. **Audit Log Tab**: Timestamped activity logs of administrative actions.
7. **System Health Tab**: Storage file integrity checks and memory metrics.
8. **Security Tab**: Active admin session revocation and lockout IP management.
9. **Settings Tab**: Admin credentials, identity, and system preference configurations.

---

## 3. Security & Access Features

### A. Configurable Password Strategy Engine
Evaluates resource access passwords using 6 strategy rules:
- `STATIC`: Fixed string comparison.
- `YEAR_RANGE`: Validates numeric input against allowed year spans.
- `MULTIPLE`: Matches against a pre-approved list of acceptable keys.
- `PREFIX`: Checks string prefix criteria.
- `SUFFIX`: Checks string suffix criteria.
- `REGEX`: Evaluates complex regular expression patterns.

### B. Configuration Versioning & Restore
- **Snapshot Storage**: Automatically saves state backups to `data/adminSnapshots.json` before modifications.
- **Atomic Restoration**: Restores previous configurations without server downtime.

### C. Anti-Autofill Security Layer
Suppresses browser password manager popups on access forms using W3C compliant attributes (`autoComplete="new-password"`) and hidden decoy input elements (`fake_user` & `fake_pass`).

For security mechanisms, see [SECURITY.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/SECURITY.md).
For performance optimizations, see [PERFORMANCE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/PERFORMANCE.md).
