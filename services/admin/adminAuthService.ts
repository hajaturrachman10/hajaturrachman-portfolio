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
  async authenticateAsync(
    username?: string,
    password?: string,
    remember = false,
    ip = "127.0.0.1"
  ): Promise<ServiceResult<{ token: string; session: AdminSession }>> {
    await adminRepository.readAsync();
    return this.authenticate(username, password, remember, ip);
  },


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
        username: state.auth.username || (process.env.ADMIN_USERNAME || "Hajaturrachman10"),
        passwords: [state.auth.passwordHash || process.env.ADMIN_PASSWORD || ""].filter(Boolean),
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
      const cleanStoredUsername = (state.auth.username || (process.env.ADMIN_USERNAME || "Hajaturrachman10")).trim().toLowerCase();
      if (cleanUsernameInput === cleanStoredUsername) {
        const storedPwd = state.auth.passwordHash || process.env.ADMIN_PASSWORD || "";
        isPasswordMatch = storedPwd ? timingSafeCompare(cleanPasswordInput, storedPwd.trim()) : false;
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

    const duration = remember
      ? ADMIN_CONFIG.SESSION_DURATION_REMEMBER
      : ADMIN_CONFIG.SESSION_DURATION_DEFAULT;

    const session: AdminSession = {
      username: activeUsername,
      remember,
      issuedAt: now,
      expiresAt: now + duration,
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

    if (valid && session) {
      return {
        success: true,
        data: { valid: true, session: { ...session, globalEpoch: state.globalEpoch } }
      };
    }

    // Invalid or missing token - return unauthorized, not a silent fallback
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi tidak valid atau sudah berakhir.",
        status: 401
      }
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
