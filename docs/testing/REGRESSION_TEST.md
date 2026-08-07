# Regression Test Suite — Portfolio v2.3.0

This document defines regression test scenarios to ensure existing business logic, security controls, and design system elements remain 100% regression-free across releases.

---

## 1. Core Feature Regression Matrix

| Feature Area | Test Scenario | Acceptance Criteria | Status |
|---|---|---|---|
| **Public Routing** | Access `/`, `/journey`, `/projects`, `/gallery`, `/ecl-b2`, `/private` | Pages load without 500 server errors or hydration crashes | PASS |
| **Language Toggle** | Switch language between ID and DE | All text labels, headings, and toast messages update instantly | PASS |
| **Theme Toggle** | Switch theme between Dark and Light mode | HTML class toggles `dark`, CSS variables update dynamically | PASS |
| **Contact Form** | Submit contact form with valid details | Message saves to `data/messages.json`, success toast displays | PASS |
| **Protected CV Access** | Attempt access to CV PDF view | Password prompt displays, correct password streams PDF | PASS |
| **Admin Protection Toggle** | Toggle feature protection status in `/admin` | `globalEpoch` increments, public tokens invalidate instantly | PASS |
| **Snapshot Restore** | Trigger snapshot restore in `/admin` | Level 3 ReAuth prompts, state restores atomically | PASS |
| **Anti-Autofill Layer** | Focus password fields in access modals | Chrome/Google Password Manager popup does not trigger | PASS |

---

## 2. Verification Protocol

1. Run `npx tsc --noEmit` to verify type safety.
2. Run `npm run build` to verify route pre-rendering and bundle integrity.
3. Perform manual sanity checks outlined in [MANUAL_TESTING.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/testing/MANUAL_TESTING.md).
