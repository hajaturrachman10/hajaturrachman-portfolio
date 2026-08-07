# Technical Reference: API Contracts & Payload Schemas

This document defines the complete API contracts, request payloads, header requirements, error formats, and `ServiceResult<T>` response structures for all API routes.

---

## 1. Standard Response Pattern: `ServiceResult<T>`

All API routes wrap responses in a standardized TypeScript envelope:

### Success Response Envelope:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Envelope:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED | INVALID_CREDENTIALS | RATE_LIMITED | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human-readable localized error description"
  }
}
```

---

## 2. Public API Contracts

### `POST /api/contact`
Submits visitor messages to the contact storage.

- **Request Body**:
  ```json
  {
    "name": "string (1-80 chars)",
    "email": "string (valid email)",
    "message": "string (1-1000 chars)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "msg_xyz123",
      "name": "Visitor Name",
      "email": "visitor@example.com",
      "message": "Message text...",
      "timestamp": "2026-08-08T01:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid email format or empty fields.
  - `429 Too Many Requests`: Rate limit exceeded for IP.

---

### `POST /api/auth/verify`
Validates passwords for protected resources (`CV`, `Private Vault`, `ECL Material`).

- **Request Body**:
  ```json
  {
    "resourceId": "cv | vault | ecl",
    "password": "string"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "signed_epoch_token_string",
      "resourceId": "cv"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid password.
  - `429 Too Many Requests`: Account locked after 5 consecutive failed attempts.

---

## 3. Administrative API Contracts

### `POST /api/admin/auth/login`
Authenticates administrator credentials and sets the `admin_session` cookie.

- **Headers Required**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response Headers**: Sets `Set-Cookie: admin_session=...; HttpOnly; Secure; SameSite=Strict; Path=/`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "admin",
      "role": "SUPER_ADMIN",
      "loginTimestamp": "2026-08-08T01:00:00.000Z"
    }
  }
  ```

---

### `POST /api/admin/features`
Updates protection states for protected site resources.

- **Headers Required**: Cookie `admin_session`
- **Request Body**:
  ```json
  {
    "resourceId": "cv | vault | ecl",
    "status": "PROTECTED | UNPROTECTED"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "resourceId": "cv",
      "status": "UNPROTECTED",
      "globalEpoch": 14
    }
  }
  ```

---

### `POST /api/admin/configuration/restore`
Restores a historical configuration snapshot atomically.

- **Headers Required**: Cookie `admin_session`, Header `X-ReAuth-Token: ...`
- **Request Body**:
  ```json
  {
    "snapshotId": "snap_1785839255900"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "restoredSnapshotId": "snap_1785839255900",
      "restoredTimestamp": "2026-08-08T01:00:00.000Z"
    }
  }
  ```

For complete route mappings, see [ROUTES.md](file:///d:/Hajat/hajaturrachman-portfolio/docs/reference/ROUTES.md).
