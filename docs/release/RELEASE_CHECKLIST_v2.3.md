# Portfolio v2.3 — Draft Release Checklist

Daftar periksa verifikasi akhir untuk rilis **Portfolio v2.3 (UX Micro-Interactions & Multilingual Enhancement)**:

- [x] **TypeScript Check**: `npx tsc --noEmit` code 0 (Clean).
- [x] **Selective MagneticButton Removal**: 4 contact cards (Email, WhatsApp, Instagram, Domisili) clear of MagneticButton, submit button retains MagneticButton wrapper.
- [x] **External Link Security**: All external links set to `target="_blank"` and `rel="noopener noreferrer"`.
- [x] **Bilingual Template Messages**: WhatsApp & Email pre-filled messages dynamically switch between ID and DE with `[Nama Anda]` / `[Ihr Name]` placeholders.
- [x] **Anti-Autofill Layer**: Chrome/Google Password Manager popups blocked on all password/username inputs.
- [x] **Command Palette Removal**: CommandPalette component and references 100% removed.
- [x] **Floating Toast Notification System**: Max 2 toasts, container-page alignment, ultra-smooth spring animation, independent 3s timers.
- [x] **Pixel-Perfect Micro-Tooltips**: Pure CSS centering, instant auto-dismiss on click, 300ms hover delay, no overflow clipping.
- [x] **Mobile Touch UX**: Touch tap feedback (`active:border-primary/60`), auto-reset on scroll (`scroll` & `touchmove`).
- [x] **Header Scroll Progress Indicator**: Glowing gradient 3px bar at top of screen (`ScrollProgress.tsx`).
- [x] **Version Update**: All codebase version references updated to `v2.3` / `2.3.0`.
