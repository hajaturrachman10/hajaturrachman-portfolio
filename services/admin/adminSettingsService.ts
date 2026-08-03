import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { ADMIN_CONFIG } from "./adminConfig";
import { ADMIN_ERRORS } from "./adminErrors";
import { logAdminEvent } from "./adminAuditLogger";
import { ServiceResult } from "./adminTypes";

export type AdminSettingsSummary = {
  username: string;
  cookieName: string;
  sessionDurationDefaultMs: number;
  sessionDurationRememberMs: number;
  lockoutDurationMs: number;
  maxAttempts: number;
  lastPasswordChange: number;
};

export const adminSettingsService = {
  getSettings(): ServiceResult<AdminSettingsSummary> {
    const state = adminRepository.read();
    return {
      success: true,
      data: {
        username: state.auth.username,
        cookieName: ADMIN_CONFIG.COOKIE_NAME,
        sessionDurationDefaultMs: ADMIN_CONFIG.SESSION_DURATION_DEFAULT,
        sessionDurationRememberMs: ADMIN_CONFIG.SESSION_DURATION_REMEMBER,
        lockoutDurationMs: ADMIN_CONFIG.LOCKOUT_DURATION,
        maxAttempts: ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS,
        lastPasswordChange: state.auth.lastPasswordChange
      }
    };
  },

  changeAdminUsername(newUsername: string): ServiceResult<{ username: string }> {
    if (!adminValidator.validateUsername(newUsername)) {
      return {
        success: false,
        error: { code: "INVALID_USERNAME", message: "Nama pengguna minimal 3 karakter.", status: 400 }
      };
    }

    const updatedState = adminRepository.update((draft) => {
      draft.auth.username = newUsername.trim();
      return draft;
    });

    logAdminEvent("USERNAME_CHANGED", `Nama pengguna admin diubah menjadi ${updatedState.auth.username}`);

    return {
      success: true,
      data: { username: updatedState.auth.username }
    };
  },

  changeAdminPassword(newPassword: string): ServiceResult<{ updated: boolean }> {
    if (!adminValidator.validatePassword(newPassword)) {
      return {
        success: false,
        error: ADMIN_ERRORS.INVALID_PASSWORD_LENGTH
      };
    }

    const now = Date.now();
    adminRepository.update((draft) => {
      draft.auth.passwordHash = newPassword;
      draft.auth.lastPasswordChange = now;
      draft.globalEpoch = now; // Revoke sessions on password change
      return draft;
    });

    logAdminEvent("PASSWORD_CHANGED", "Kata sandi admin berhasil diperbarui");

    return {
      success: true,
      data: { updated: true }
    };
  }
};
