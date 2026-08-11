# Standards for Overlay & Session Transition Animations

Whenever creating, modifying, or refactoring overlay loading animations, session restoration overlays, locking/securing session views, feature toggle overlays, or snapshot/audit loading states in this project, strictly follow these exact 1:1 standards:

## 1. Structure & Layout Rules
- **Container Class**: Use standard card layout `premium-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center gap-3.5 w-full border border-line bg-surface select-none shadow-card`.
- **Full Width**: Always use `w-full` without `max-w-lg` constraints so the card fills the container width naturally.
- **Card Height**: Standardize minimum height to `min-h-[340px] sm:min-h-[380px]` (340px on mobile, 380px on desktop).
- **Element Spacing**: Use `gap-3.5` between icon box, badge, title, and progress bar.

## 2. Element Specification (4 Core Elements Only)
1. **Icon Box**:
   - `grid h-12 w-12 place-items-center rounded-2xl border shadow-glow`
   - Icon: `<Loader2 className="h-6 w-6" />` spinning circular loader with Framer Motion `animate={{ rotate: 360 }}` (duration: 0.85s, ease: "linear").
   - NO spinning non-loader icons (e.g. LogOut, Shield). Always use `Loader2`.
2. **Badge Pill Tag**:
   - `inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider mb-1 border`
   - Text: Uppercase status tag (e.g., `MEMUAT HALAMAN`, `PEMULIHAN SESI ADMIN`, `PENUTUPAN SESI ADMIN`, `OTENTIKASI DOKUMEN CV`, `ENKRIPSI VAULT PRIBADI`, `AKSES MATERI ECL`, `RESTORASI SNAPSHOT`, `AUDIT LOG SISTEM`).
3. **Heading Title**:
   - `font-display text-sm sm:text-base font-black`
   - Concise title text (e.g., `Memuat Halaman...`, `Memulihkan Sesi Admin Aktif...`, `Mengakhiri Sesi & Menghapus Token...`).
   - **NO Subtitle Paragraphs**: Never add `<p>` paragraph text under the heading title.
4. **Progress Bar Indicator**:
   - Container: `w-full max-w-[160px] h-1.5 rounded-full overflow-hidden border`
   - Filled Bar: `<motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.0, ease: "easeInOut" }} />`.

## 3. Pure Dual-Color System
- **Emerald (Green)**: Used for all positive/enabling/restoring/locking protection actions.
  - Icon box: `border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20`
  - Badge tag: `bg-emerald-500/10 text-emerald-500 border-emerald-500/20`
  - Heading: `text-emerald-500`
  - Progress bar: `bg-emerald-500/15 border-emerald-500/20` container with `bg-emerald-500` filled bar.
- **Rose (Red)**: Used for all negative/disabling/logout/securing session actions.
  - Icon box: `border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-rose-500/20`
  - Badge tag: `bg-rose-500/10 text-rose-500 border-rose-500/20`
  - Heading: `text-rose-500`
  - Progress bar: `bg-rose-500/15 border-rose-500/20` container with `bg-rose-500` filled bar.
- **Forbidden Colors**: Do not use indigo, cyan, amber, purple, or blue for overlay loading animations.

## 4. Session & Refresh Logic (Remember Session Preference)
- **If Remember Session is ENABLED (`rememberSession === true`)**:
  - Refreshing or visiting an active session triggers the Emerald **PEMULIHAN SESI** overlay for ~1.0s before displaying content.
- **If Remember Session is DISABLED (`rememberSession === false`)**:
  - Refreshing or visiting an active session triggers the Rose **PENUTUPAN SESI** overlay for ~1.0s, revokes server session, and redirects to login view.
- **If Position is LOCKED / UNAUTHENTICATED**:
  - Directly render the login form immediately (0ms delay) without showing any session restoration overlay.

## 5. Anti-Collision & Global Page Loading Rules
- **Debounced Page Loader**: Global `LoadingSpinner` MUST implement a 250ms debounce threshold so fast/instant route transitions do NOT flash or trigger full-screen spinners unnecessarily.
- **Zero Collision Guarantee**: Never trigger both a global full-screen `LoadingSpinner` and an in-card session restoration overlay simultaneously. If an in-card overlay is handling session restoration (`isUnlocking` / `isLocking`), the global loader stays suppressed.
- **Fast-Path Caching**: Utilize `sessionStorage` fast-path caching (`ecl_verified_override`, `cv_verified_override`, `vault_verified_override`) so returning sub-navigations open instantly with 0ms flicker.
- **Smooth Staggered Transition**: All page transitions must complete smoothly first before content fades in cleanly.
