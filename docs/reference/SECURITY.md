# Single Source of Truth: Security Architecture & Controls

This document serves as the Single Source of Truth (SSOT) for all security mechanisms, session protocols, and hardening controls implemented across the system.

---

## 1. Authentication & Session Architecture

### A. HMAC-SHA256 Signed Session Cookies
- **Cookie Name**: `admin_session`
- **Encoding**: JSON payload encoded via `base64url` and signed with HMAC-SHA256 signature using `timingSafeCompare` constant-time comparison to prevent timing attacks.
- **Security Flags**: `HttpOnly`, `Secure` (in production), `SameSite=Strict`, `Path=/`.
- **Inactivity Timeout**: Active admin sessions expire after 30 minutes of idle inactivity.

### B. Global Epoch Session Revocation (`globalEpoch`)
- Every session token encodes the `globalEpoch` value present at issue time.
- When an admin updates protection states or revokes sessions, `globalEpoch` increments in `data/adminState.json`.
- Subsequent requests with outdated epoch tokens are immediately rejected, invalidating public/admin sessions globally without requiring database session tables.

---

## 2. Access Control & Protection Layers

### A. IP Lockout & Rate Limiting (`adminLockoutService`)
- Tracks consecutive failed authentication attempts by IP address.
- Exceeding 5 failed attempts locks out the IP for 15 minutes.
- Admin can manually inspect locked IPs and trigger a Level 3 Re-Auth lockout reset.

### B. Dangerous Action Safety Layer (Level 3 Re-Auth)
- Destructive operations (Snapshot Restore, Global Session Revocation, IP Lockout Reset, Password Override) require Level 3 Re-Authentication (`ReAuthModal`).

### C. Anti-Autofill Security Layer
- Prevents browser/Google Password Manager popups from intercepting sensitive password forms (`PasswordModal`, `AdminLoginView`, `ReAuthModal`).
- Employs hidden decoy inputs (`fake_user` / `fake_pass`) and W3C compliant attributes (`autoComplete="new-password"`, `aria-autocomplete="none"`, `data-form-type="other"`).

---

## 3. Data Protection & Input Sanitization

- **Constant-time String Comparison**: All password and token comparisons utilize `crypto.timingSafeCompare` to prevent side-channel timing analysis.
- **Sanitized JSON Storage**: Administrative state files are isolated on disk and inaccessible from public URL routes.
- **Strict CORS & HTTP Security Headers**: Configured in `next.config.mjs` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

For API implementations, see [API_REFERENCE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/API_REFERENCE.md).
For feature details, see [FEATURE_REFERENCE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/FEATURE_REFERENCE.md).
