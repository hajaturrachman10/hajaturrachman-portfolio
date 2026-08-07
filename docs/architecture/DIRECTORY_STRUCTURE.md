# Repository Directory Structure & Module Boundaries

This document defines the physical organization of the repository and the architectural responsibility of each directory.

---

## 1. Directory Tree Map

```
hajaturrachman-portfolio/
├── app/                                  # Next.js App Router Pages & API Routes
│   ├── admin/                            # Hidden Admin Control Center Entry Route
│   ├── api/                              # HTTP API Adapters (/api/admin/*, /api/auth/*, etc.)
│   ├── ecl-b2/                           # ECL B2 German Learning & Materials Routes
│   ├── gallery/                          # Media Gallery Showcase Route
│   ├── journey/                          # Career & Ausbildung Education Timeline Route
│   ├── private/                          # Protected Private Vault Route
│   ├── projects/                         # Software & Web Development Projects Route
│   ├── globals.css                       # Global Design System Tokens & Utility Styles
│   ├── layout.tsx                        # Root Application Layout & Global Providers
│   ├── loading.tsx                       # Global Page Loading Fallback UI
│   ├── not-found.tsx                     # Custom 404 Route & Metadata Handler
│   ├── sitemap.ts                        # Dynamic XML Sitemap Generator
│   └── template.tsx                      # Page Transition Layout Wrapper
├── components/                           # Shared UI Components & Layout Elements
│   ├── layout/                           # Navbar, Footer, PageTransition, TemplateWrapper
│   ├── modals/                           # Interactive Dialog Modals (Confirm, Password, Share, etc.)
│   ├── providers/                        # LanguageContext, ThemeProvider, ToastProvider
│   ├── sections/                         # Section-level Blocks (HeroSection, ContactSection, etc.)
│   ├── ui/                               # Atomic UI Primitives (Toast, Tooltip, ScrollProgress, etc.)
│   └── views/                            # Standalone View Assemblies (NotFoundView)
├── data/                                 # Static Content & Local JSON Data Storage
│   ├── adminSnapshots.json               # Configuration Versioning Snapshot History
│   ├── adminState.json                   # Primary Admin Configuration & Security State
│   ├── messages.json                     # Contact Form Submissions Storage
│   └── site.ts                           # Multilingual Portfolio Content Assets
├── docs/                                 # Software Architecture & Engineering Documentation
│   ├── adr/                              # Architectural Decision Records (ADR 001 - 010)
│   ├── architecture/                     # High-level System Architecture & Structure Maps
│   ├── reference/                        # Technical Reference Manuals (Routes, API, Security, etc.)
│   ├── release/                          # Release Notes, Checklists, & CHANGELOG
│   ├── rfc/                              # Technical Design RFC Documents
│   └── testing/                          # Manual & Regression Testing Guides
├── features/                             # Domain-Isolated Business Modules
│   ├── admin/                            # Admin Control Center Dashboard UI & Tabs
│   ├── cv/                               # Protected CV Document Viewing Module
│   ├── ecl/                              # ECL B2 German Language Materials Module
│   └── vault/                            # Private Protected File Vault Module
├── hooks/                                # Custom Reusable React Hooks
├── lib/                                  # Core Utilities (Security, Scroll Lock, Cross-Tab Sync)
├── services/                             # Server-side Business Logic & Service Controllers
│   └── admin/                            # Admin Service Layer (Auth, Security, Strategy, etc.)
└── public/                               # Static Assets (Images, Icons, PDF Documents)
```

---

## 2. Component Boundaries & Rules

1. **`app/`**: Must only contain route handlers and page layouts. Business logic must be delegated to `services/`.
2. **`components/`**: Shared presentation elements. Must not import directly from `features/`.
3. **`features/`**: Encapsulated domain modules (`admin`, `cv`, `ecl`, `vault`). Can import from `components/` and `services/`.
4. **`services/`**: Server-only business logic. Must not import any React components or client-side hooks.
5. **`data/`**: Pure JSON state and static asset definitions. No executable code.
