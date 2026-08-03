export const ADMIN_ERRORS = {
  INVALID_LOGIN: { code: "INVALID_LOGIN", message: "Nama pengguna atau kata sandi tidak valid.", status: 401 },
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "Akses ditolak. Sesi admin tidak valid.", status: 401 },
  SESSION_EXPIRED: { code: "SESSION_EXPIRED", message: "Akses memerlukan autentikasi admin.", status: 401 },
  LOCKED_OUT: { code: "LOCKED_OUT", message: "Percobaan login melebihi batas. Akses dibekukan sementara.", status: 429 },
  FEATURE_NOT_FOUND: { code: "FEATURE_NOT_FOUND", message: "Fitur yang diminta tidak ditemukan.", status: 400 },
  INVALID_STATE: { code: "INVALID_STATE", message: "Data keadaan admin tidak valid.", status: 500 },
  INVALID_PASSWORD_LENGTH: { code: "INVALID_PASSWORD_LENGTH", message: "Kata sandi minimal harus 8 karakter.", status: 400 }
} as const;

export type AdminErrorCode = keyof typeof ADMIN_ERRORS;
