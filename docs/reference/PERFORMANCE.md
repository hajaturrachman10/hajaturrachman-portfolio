# Single Source of Truth: Performance & Optimization Architecture

This document serves as the Single Source of Truth (SSOT) for all performance optimizations, asset delivery strategies, and runtime efficiency mechanisms.

---

## 1. Build & Bundle Optimizations

- **Next.js SWC Minification**: Code minification handled natively via SWC (`swcMinify: true`).
- **Package Import Shaking**: Selective package import optimization for `lucide-react` and `framer-motion` via `next.config.mjs` (`optimizePackageImports`).
- **Shared Bundle Efficiency**: Core shared JavaScript bundle footprint maintained under ~88 kB First Load JS.

---

## 2. Image & Asset Delivery Optimization

- **Modern Formats**: Images served in Next.js `AVIF` and `WebP` formats.
- **Cache-Control Headers**: Static assets served with immutable 1-year cache headers (`public, max-age=31536000, immutable`).
- **Domain Remote Patterns**: Remote image patterns configured for external QR code generation services (`api.qrserver.com`).

---

## 3. Motion & Micro-Interaction Performance

- **GPU Acceleration**: Heavy motion components utilize CSS `transform-gpu` and `will-change-[transform,opacity]` to leverage hardware-accelerated compositor layers.
- **Lazy Component Code Splitting**: Heavy dialog modals (e.g. `ShareModal`) use Next.js `dynamic()` imports to defer client bundle loading until triggered.
- **Event Listener Cleanup**: Window `scroll` and `touchmove` listeners use `{ passive: true }` and debounce timers to avoid layout thrashing.
- **Real-Time Cross-Tab Event Efficiency**: Browser `BroadcastChannel` provides zero-polling real-time updates between admin and public tabs.

For technical stack references, see [TECH_STACK.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/TECH_STACK.md).
For architectural details, see [ARCHITECTURE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/architecture/ARCHITECTURE.md).
