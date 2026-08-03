import {
  resetAuthRateLimit,
  clearAllAuthRateLimits,
  getAllAuthRateLimits,
  checkAuthRateLimit
} from "@/lib/security";
import { ServiceResult, LockoutState } from "./adminTypes";
import { logAdminEvent } from "./adminAuditLogger";

export const adminLockoutService = {
  resetAllLockouts(): ServiceResult<{ reset: boolean; count: number }> {
    const list = getAllAuthRateLimits();
    const count = list.length;
    clearAllAuthRateLimits();
    logAdminEvent("LOCKOUT_RESET", `Seluruh pembekuan IP (${count} entri) telah dibersihkan`);

    return {
      success: true,
      data: { reset: true, count }
    };
  },

  resetLockout(ip: string): ServiceResult<{ ip: string; reset: boolean }> {
    resetAuthRateLimit(ip);
    logAdminEvent("LOCKOUT_RESET", `Pembekuan IP ${ip} telah di-reset`, ip);

    return {
      success: true,
      data: { ip, reset: true }
    };
  },

  clearFailedAttempts(ip: string): ServiceResult<{ ip: string; cleared: boolean }> {
    resetAuthRateLimit(ip);
    logAdminEvent("LOCKOUT_RESET", `Hitungan kesalahan IP ${ip} telah dibersihkan`, ip);
    return {
      success: true,
      data: { ip, cleared: true }
    };
  },

  clearAllFailedAttempts(): ServiceResult<{ reset: boolean; count: number }> {
    return this.resetAllLockouts();
  },

  getLockoutStatus(ip: string): ServiceResult<LockoutState> {
    const status = checkAuthRateLimit(ip);
    return {
      success: true,
      data: {
        attempts: status.allowed ? 0 : 5,
        lockoutUntil: status.allowed ? null : Date.now() + status.remainingSeconds * 1000
      }
    };
  },

  getAllLockouts(): ServiceResult<Array<{ ip: string; attempts: number; lockoutUntil: number }>> {
    return {
      success: true,
      data: getAllAuthRateLimits()
    };
  }
};
