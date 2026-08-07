# System Overview & Subsystem Integration

This document describes the high-level system components, subsystem relationships, and operational flows across the Portfolio platform.

---

## 1. Core Subsystems

The application consists of four primary operational subsystems:

```
+-----------------------------------------------------------------------------------+
|                                 PORTFOLIO SYSTEM                                  |
+--------------------------+-----------------------------+--------------------------+
|  Public Portfolio Front  |  Protected Access Subsystem |  Admin Control Center    |
|  - Multilingual Engine   |  - Password Strategy Engine |  - Feature Toggles       |
|  - Toast & Tooltip System|  - CV & Private Vault Gate  |  - Security & Lockout    |
|  - Scroll Progress Bar   |  - Anti-Autofill Layer      |  - Snapshot History      |
+--------------------------+-----------------------------+--------------------------+
|                           Cross-Tab Synchronization Layer                         |
+-----------------------------------------------------------------------------------+
```

1. **Public Portfolio Frontend**: Handles visitor navigation, internationalization (ID/DE), contact submission, media showcase, and UI micro-interactions.
2. **Protected Access Subsystem**: Enforces multi-strategy password authentication for gated resources (`CV`, `Private Vault`, `ECL Material`).
3. **Admin Control Center**: Isolated management interface providing operational control, audit logging, feature toggles, security lockout management, and snapshot restoration.
4. **Real-time Synchronization Engine**: Coordinates client state across open browser tabs using `BroadcastChannel` events and synchronized epoch revocation.

---

## 2. Interaction Sequence Flow

### Contact Submission & Real-time Admin Notification Flow:
```mermaid
sequenceDiagram
    autonumber
    actor Visitor
    participant PublicUI as Contact Form
    participant API as /api/contact
    participant Service as Contact Service
    participant Storage as data/messages.json
    participant Channel as BroadcastChannel
    participant AdminUI as Admin Dashboard

    Visitor->>PublicUI: Fill & Submit Form
    PublicUI->>API: POST /api/contact Payload
    API->>Service: Validate & Execute
    Service->>Storage: Append Message Record
    Service-->>API: Return ServiceResult<Success>
    API-->>PublicUI: Response + Toast Notification
    PublicUI->>Channel: Dispatch 'contact_message_submitted'
    Channel->>AdminUI: Signal Received
    AdminUI->>AdminUI: Update Messages Counter Real-time
```

### Protection Toggle & Instant Public Revocation Flow:
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as Features Tab
    participant API as /api/admin/features
    participant Service as Admin Toggle Service
    participant State as data/adminState.json
    participant Visitor as Public Visitor

    Admin->>AdminUI: Toggle Feature Protection (ON -> OFF)
    AdminUI->>API: POST /api/admin/features
    API->>Service: Update Protection State
    Service->>State: Increment globalEpoch & Save
    Service-->>API: ServiceResult<Success>
    API-->>AdminUI: UI State Updated
    Visitor->>Visitor: Next Request Sends Stale Epoch Token
    Visitor->>Visitor: Access Denied / Instant Revocation
```

---

## 3. Operational Guarantees

- **Zero-Downtime Feature Toggling**: Protection states update in-memory and persist to JSON without requiring server restarts.
- **Fail-Safe Fallbacks**: Local state storage falls back to safe default configurations if disk reads fail.
- **Isolation of Admin Logic**: Public routes contain zero administrative controller logic or direct file write handlers.

For detailed technical references:
- See [SECURITY.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/SECURITY.md) for session security protocols.
- See [FEATURE_REFERENCE.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/FEATURE_REFERENCE.md) for feature specifications.
