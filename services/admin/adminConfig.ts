export const ADMIN_CONFIG = {
  COOKIE_NAME: "admin_session",
  SESSION_DURATION_DEFAULT: 2 * 60 * 60 * 1000, // 2 Hours in ms
  SESSION_DURATION_REMEMBER: 30 * 24 * 60 * 60 * 1000, // 30 Days in ms
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 Minutes in ms
  MAX_LOGIN_ATTEMPTS: 5,
  FEATURES: ["cv", "vault", "ecl", "ecl_doc1", "ecl_doc2", "ecl_doc3"] as const
};
