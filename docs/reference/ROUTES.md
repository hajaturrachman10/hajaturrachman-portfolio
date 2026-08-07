# Single Source of Truth: Application Routes & Endpoints

This document serves as the authoritative Single Source of Truth (SSOT) for all pages, API endpoints, dynamic routes, and protected routes across the application.

---

## 1. Public Pages (Static / Prerendered)

| Route Path | Description | Rendering Strategy | Protection Level |
|---|---|---|---|
| `/` | Primary Portfolio Landing Page | Static Pre-rendered | Public |
| `/journey` | Career & Education Timeline | Static Pre-rendered | Public |
| `/projects` | Software Projects Archive | Static Pre-rendered | Public |
| `/gallery` | Media Showcase & Video Gallery | Static Pre-rendered | Public |
| `/ecl-b2` | ECL B2 German Learning Materials | Static Pre-rendered | Configurable (Public / Password) |
| `/ecl-b2/unavailable` | Disabled Document Notice | Dynamic Server-rendered | Public |
| `/private` | Private Document Vault | Static Pre-rendered | Configurable (Public / Password) |
| `/_not-found` | Custom 404 Error View | Static Pre-rendered | Public |
| `/sitemap.xml` | Dynamic XML Sitemap Generator | Dynamic Edge Route | Public |
| `/robots.txt` | Crawler Instructions File | Static Asset Route | Public |

---

## 2. Administrative Pages (Protected & Hidden)

| Route Path | Description | Access Control | Primary Features |
|---|---|---|---|
| `/admin` | Admin Control Center Entry | HMAC Session Cookie | Login View / Dashboard (9 Tabs) |

---

## 3. Public API Endpoints

| Endpoint | Method | Request Payload | Response Type | Description |
|---|---|---|---|---|
| `/api/contact` | `POST` | `{ name, email, message }` | `ServiceResult<ContactMessage>` | Submits contact form & stores message |
| `/api/auth/verify` | `POST` | `{ resourceId, password }` | `ServiceResult<{ token }>` | Verifies protected resource password |
| `/api/auth/status` | `GET` | — | `ServiceResult<{ protected }>` | Checks protection status for resource |
| `/api/auth/lock` | `POST` | `{ resourceId }` | `ServiceResult<boolean>` | Locks public access session |
| `/api/cv/view` | `GET` | Query `?token=...` | PDF Stream / Error | Streams protected CV PDF document |
| `/api/vault/data` | `GET` | Query `?token=...` | JSON Data Stream | Streams protected Private Vault files |

---

## 4. Administrative API Endpoints

| Endpoint | Method | Security Level | Functionality |
|---|---|---|---|
| `/api/admin/auth/login` | `POST` | IP Rate Limited (5x) | Authenticates admin & sets HMAC cookie |
| `/api/admin/auth/logout` | `POST` | Session Cookie | Destroys admin session cookie |
| `/api/admin/auth/session` | `GET` | Session Cookie | Returns active admin session metadata |
| `/api/admin/auth/re-auth` | `POST` | Level 3 Re-Auth | Re-authenticates admin for destructive actions |
| `/api/admin/auth/dev-reset` | `POST` | Dev Environment Only | Resets dev credentials to defaults |
| `/api/admin/features` | `GET`, `POST` | Session Cookie | Reads / updates Feature Protection Toggles |
| `/api/admin/features/revoke` | `POST` | Level 3 Re-Auth | Triggers instant global epoch session revocation |
| `/api/admin/settings` | `GET`, `POST` | Session Cookie | Manages admin credentials & system metadata |
| `/api/admin/statistics` | `GET` | Session Cookie | Retrieves traffic stats, unlocks, & lockout metrics |
| `/api/admin/strategies` | `GET`, `POST` | Session Cookie | Reads / updates Password Strategy Engine rules |
| `/api/admin/strategies/validate` | `POST` | Session Cookie | Pre-validates password strategy rules against inputs |
| `/api/admin/configuration/history` | `GET` | Session Cookie | Retrieves configuration snapshot history |
| `/api/admin/configuration/preview` | `POST` | Session Cookie | Previews historical snapshot data without saving |
| `/api/admin/configuration/restore` | `POST` | Level 3 Re-Auth | Restores configuration snapshot atomically |
| `/api/admin/configuration/export` | `GET` | Session Cookie | Downloads secure JSON backup of configuration |
| `/api/admin/lockout/reset` | `POST` | Level 3 Re-Auth | Resets IP lockout blocks for blocked visitors |
| `/api/admin/health` | `GET` | Session Cookie | Checks system health & file storage integrity |
| `/api/admin/security` | `GET` | Session Cookie | Returns security audit logs & active sessions |
| `/api/admin/session/revoke` | `POST` | Level 3 Re-Auth | Revokes specific active admin sessions |
| `/api/admin/accounts` | `GET` | Session Cookie | Lists admin account profiles & permissions |
| `/api/messages` | `GET`, `DELETE` | Session Cookie | Retrieves & deletes visitor contact messages |

For detailed payload structures and contract schemas, see [API_REFERENCE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/API_REFERENCE.md).
