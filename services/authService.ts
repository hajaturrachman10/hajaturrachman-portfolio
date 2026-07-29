import {
  getClientIp,
  checkAuthRateLimit,
  recordFailedAuthAttempt,
  resetAuthRateLimit,
  timingSafeCompare,
  generateSessionToken,
  verifySessionToken
} from "@/lib/security";

export type AuthType = "cv" | "private-vault" | "ecl-material";

export const authService = {
  getClientIp,
  checkRateLimit: (ip: string) => checkAuthRateLimit(ip),
  resetRateLimit: (ip: string) => resetAuthRateLimit(ip),
  recordFailedAttempt: (ip: string) => recordFailedAuthAttempt(ip),

  verifyPassword(type: AuthType, password: string): { isValid: boolean; cookieName: string } {
    const cleanInput = password.trim();
    let isValid = false;
    let cookieName = "";

    if (type === "cv") {
      const expectedPassword = (process.env.CV_PASSWORD || "cvhajat2026").trim();
      isValid = timingSafeCompare(cleanInput, expectedPassword);
      cookieName = "cv_unlocked";
    } else if (type === "private-vault") {
      const expectedPassword = (process.env.PRIVATE_VAULT_PASSWORD || "hajatprivat2026").trim();
      isValid = timingSafeCompare(cleanInput, expectedPassword);
      cookieName = "vault_unlocked";
    } else if (type === "ecl-material") {
      const allowedEclPasswords = Array.from(
        { length: 2026 - 2006 + 1 },
        (_, i) => `10juli${2006 + i}`
      );
      isValid = allowedEclPasswords.some((allowed) => timingSafeCompare(cleanInput, allowed));
      cookieName = "ecl_unlocked";
    }

    return { isValid, cookieName };
  },

  createSessionToken(type: AuthType): string {
    return generateSessionToken(type);
  },

  getAuthStatus(cvToken?: string, vaultToken?: string, eclToken?: string) {
    return {
      cvUnlocked: verifySessionToken(cvToken, "cv"),
      vaultUnlocked: verifySessionToken(vaultToken, "private-vault"),
      eclUnlocked: verifySessionToken(eclToken, "ecl-material")
    };
  }
};
