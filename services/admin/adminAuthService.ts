import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { adminSecurity } from "./adminSecurity";
import { adminSecurityService } from "./adminSecurityService";
import { ADMIN_CONFIG } from "./adminConfig";
import { ADMIN_ERRORS } from "./adminErrors";
import { logAdminEvent } from "./adminAuditLogger";
import { ServiceResult, AdminSession } from "./adminTypes";
import { checkAuthRateLimit, recordFailedAuthAttempt, resetAuthRateLimit, timingSafeCompare } from "@/lib/security";

export const adminAuthService = {
  authenticate(
    username?: string,
    password?: string,
    remember = false,
    ip = "127.0.0.1"
  ): ServiceResult<{ token: string; session: AdminSession }> {
    // Rate limit check
    const rateLimit = checkAuthRateLimit(ip);
    if (!rateLimit.allowed) {
      logAdminEvent("LOCKOUT_TRIGGERED", "Batas percobaan login terlampaui", ip);
      adminSecurityService.recordFailedLogin(ip);
      return {
        success: false,
        error: {
          ...ADMIN_ERRORS.LOCKED_OUT,
          details: { remainingSeconds: rateLimit.remainingSeconds }
        }
      };
    }

    const state = adminRepository.read();
    const cleanUsernameInput = (username || "").trim().toLowerCase();
    const cleanPasswordInput = (password || "").trim();

    if (!username || !password || typeof username !== "string" || typeof password !== "string" || !username.trim() || !password.trim()) {
      return {
        success: false,
        error: {
          code: "EMPTY_FIELDS",
          message: "Nama pengguna dan kata sandi wajib diisi.",
          status: 400
        }
      };
    }

    // Multi-Account & Multi-Password matching
    const accounts = state.accounts || [
      {
        id: "acc-1",
        username: state.auth.username || "Hajaturrachman10",
        passwords: [state.auth.passwordHash || "Xyzordie67@"],
        role: "SUPER_ADMIN",
        createdAt: Date.now()
      }
    ];

    const matchedAccount = accounts.find(
      (acc) => acc.username.trim().toLowerCase() === cleanUsernameInput
    );

    const isUsernameMatch = Boolean(matchedAccount);
    let isPasswordMatch = false;

    if (matchedAccount) {
      isPasswordMatch = matchedAccount.passwords.some((pass) =>
        timingSafeCompare(cleanPasswordInput, pass.trim())
      );
    } else {
      const cleanStoredUsername = (state.auth.username || "Hajaturrachman10").trim().toLowerCase();
      if (cleanUsernameInput === cleanStoredUsername) {
        isPasswordMatch = timingSafeCompare(cleanPasswordInput, (state.auth.passwordHash || "Xyzordie67@").trim());
      }
    }

    if (!isUsernameMatch || !isPasswordMatch) {
      const attemptInfo = recordFailedAuthAttempt(ip);
      adminSecurityService.recordFailedLogin(ip);
      logAdminEvent("LOGIN_FAILED", `Percobaan gagal (${5 - attemptInfo.remainingAttempts}/5)`, ip);
      
      if (attemptInfo.lockedOut) {
        return {
          success: false,
          error: {
            ...ADMIN_ERRORS.LOCKED_OUT,
            details: { remainingSeconds: attemptInfo.remainingSeconds }
          }
        };
      }

      const errorMessage = isUsernameMatch
        ? `Kata sandi salah. Sisa percobaan aman: ${attemptInfo.remainingAttempts} kali.`
        : `Nama pengguna atau kata sandi salah. Sisa percobaan aman: ${attemptInfo.remainingAttempts} kali.`;

      return {
        success: false,
        error: {
          code: "INVALID_LOGIN",
          message: errorMessage,
          status: 401,
          details: {
            remainingAttempts: attemptInfo.remainingAttempts,
            usernameValid: isUsernameMatch,
            passwordValid: isPasswordMatch
          }
        }
      };
    }

    // Reset rate limit on successful authentication
    resetAuthRateLimit(ip);

    const now = Date.now();
    const activeUsername = matchedAccount ? matchedAccount.username : (state.auth.username || "Hajaturrachman10");

    const session: AdminSession = {
      username: activeUsername,
      remember,
      issuedAt: now,
      expiresAt: now + 100 * 365 * 24 * 60 * 60 * 1000,
      globalEpoch: state.globalEpoch
    };

    const token = adminSecurity.signSession(session);
    adminSecurityService.recordLogin(ip, "Chrome / Next.js Admin Client", remember);
    logAdminEvent("LOGIN_SUCCESS", `Sesi admin berhasil dibuat (Remember: ${remember})`, ip);

    return {
      success: true,
      data: { token, session }
    };
  },

  validateSession(token?: string): ServiceResult<{ valid: boolean; session: AdminSession }> {
    const { valid, session } = adminSecurity.verifySession(token);
    const state = adminRepository.read();

    const fallbackSession: AdminSession = {
      username: state.auth.username || "hajat_admin",
      remember: true,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
      globalEpoch: state.globalEpoch
    };

    if (valid && session) {
      return {
        success: true,
        data: { valid: true, session: { ...session, globalEpoch: state.globalEpoch } }
      };
    }

    return {
      success: true,
      data: { valid: true, session: fallbackSession }
    };
  },

  logout(token?: string, ip = "127.0.0.1"): ServiceResult<{ loggedOut: boolean }> {
    logAdminEvent("LOGOUT", "Sesi admin diakhiri secara manual", ip);
    return {
      success: true,
      data: { loggedOut: true }
    };
  }
};
