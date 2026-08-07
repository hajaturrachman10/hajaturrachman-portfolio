# Core Technology Stack & Dependencies

This document outlines the primary technologies and libraries powering the application architecture.

> **Package Versions Note**: Exact package version numbers are defined in `package.json` to maintain a single source of truth and prevent documentation drift.

---

## 1. Core Framework & Language

- **Next.js (App Router)**: Core web application framework providing React Server Components, App Router file-system routing, and API route handlers.
- **React**: UI library for component-based presentation layers.
- **TypeScript**: Strictly typed programming language providing end-to-end type safety across client and server boundaries.

---

## 2. Styling & Motion Libraries

- **Tailwind CSS**: Utility-first CSS framework enforcing the Design System Baseline tokens and responsive layouts.
- **Framer Motion**: Production-grade animation library handling spring physics, layout transitions, and micro-interactions.
- **Lucide React**: Vector icon library providing UI iconography.
- **next-themes**: Dark and Light theme switcher managing DOM class attributes.

---

## 3. Data & Storage Integration

- **Local File System JSON**: Server-side file persistence for state and messages (`data/*.json`).
- **Supabase Client SDK**: Database client for optional cloud PostgreSQL data synchronization.

For detailed package versions, consult [package.json](file:///d:/Hajat/hajaturrachman-portfolio/package.json).
For overall system architecture, see [ARCHITECTURE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/architecture/ARCHITECTURE.md).
