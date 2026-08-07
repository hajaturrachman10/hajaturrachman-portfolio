# Comprehensive Manual Testing Guide — Portfolio v2.3.0

This document outlines the step-by-step manual test procedures for verifying user interface interactions, security gates, and administrative features.

---

## 1. User Interface & Micro-Interaction Testing

### Test Case 1.1: Floating Toast Notifications
1. Navigate to main landing page `/`.
2. Click the Language Switcher button (`ID / DE`).
3. **Expected Result**: A floating toast notification appears at the bottom-right corner aligned with the Navbar boundary.
4. Click the Theme Toggle button (`Light / Dark`).
5. **Expected Result**: A second toast appears below the first.
6. Observe the toasts for 3 seconds.
7. **Expected Result**: Toast 1 automatically slides out after 3 seconds. Toast 2 remains on screen and slides out 3 seconds after its own creation.

### Test Case 1.2: Pixel-Perfect Tooltips
1. Hover over the Language Switcher, Share, or Theme Toggle buttons in the Navbar.
2. **Expected Result**: After a 300ms delay, a centered tooltip appears underneath the button.
3. Click the button while hovering.
4. **Expected Result**: The tooltip immediately vanishes upon click/tap (*auto-dismiss*).

### Test Case 1.3: Mobile Touch Scroll Auto-Reset
1. Open site on a mobile device or Chrome DevTools Mobile View.
2. Tap the Language Switcher or Theme Toggle button.
3. **Expected Result**: The button displays blue visual tap feedback (`:active`).
4. Drag/scroll the page vertically.
5. **Expected Result**: The button immediately reverts to its default gray/neutral state as soon as scrolling starts.

### Test Case 1.4: Header Scroll Progress Indicator
1. Scroll down the page.
2. **Expected Result**: A 3px glowing gradient line at the top of the viewport fills horizontally from 0% to 100% in real-time.

---

## 2. Security & Admin Control Testing

### Test Case 2.1: Protected Resource Password Gate
1. Navigate to `/private` or click CV preview.
2. Enter incorrect password 5 times.
3. **Expected Result**: Access is blocked with rate limit error.

### Test Case 2.2: Admin Login & Session Management
1. Navigate to hidden `/admin` route.
2. Enter valid admin credentials.
3. **Expected Result**: Redirected to Admin Dashboard with active session.
4. Inspect browser cookies.
5. **Expected Result**: `admin_session` cookie is set with `HttpOnly` & `SameSite=Strict`.

For regression suites, see [REGRESSION_TEST.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/testing/REGRESSION_TEST.md).
