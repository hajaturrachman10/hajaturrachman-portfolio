import { adminRepository } from "./adminRepository";
import { adminSnapshotRepository } from "./adminSnapshotRepository";
import { logAdminEvent } from "./adminAuditLogger";
import { ServiceResult } from "./adminTypes";
import { timingSafeCompare } from "@/lib/security";

export const adminSecurityService = {
  verifySensitiveAction(password?: string): ServiceResult<{ verified: boolean }> {
    if (!password || typeof password !== "string" || password.trim() === "") {
      logAdminEvent("REAUTH_FAILED", "Kata sandi re-authentikasi tidak boleh kosong");
      return {
        success: false,
        error: { code: "INVALID_REAUTH", message: "Kata sandi re-autentikasi wajib diisi.", status: 400 }
      };
    }

    const state = adminRepository.read();
    const cleanInput = password.trim();

    // Check against main auth.passwordHash
    const mainMatch = state.auth.passwordHash
      ? timingSafeCompare(cleanInput, state.auth.passwordHash.trim())
      : false;

    // Check against ALL registered account passwords (multi-account support)
    const accountMatch = (state.accounts || []).some((acc) =>
      (acc.passwords || []).some((p) => p && timingSafeCompare(cleanInput, p.trim()))
    );

    const isMatch = mainMatch || accountMatch;

    if (!isMatch) {
      logAdminEvent("REAUTH_FAILED", "Verifikasi kata sandi re-autentikasi gagal");
      return {
        success: false,
        error: { code: "UNAUTHORIZED_REAUTH", message: "Kata sandi re-autentikasi salah.", status: 401 }
      };
    }

    logAdminEvent("REAUTH_SUCCESS", "Re-autentikasi verifikasi aksi sensitif berhasil");
    return {
      success: true,
      data: { verified: true }
    };
  },

  recordLogin(ip = "127.0.0.1", userAgent = "Unknown", remember = false): void {
    adminRepository.update((draft) => {
      draft.lastLogin = {
        time: Date.now(),
        ip,
        browser: userAgent.slice(0, 50),
        remember
      };

      const history = draft.loginHistory || {
        failedCountToday: 0,
        successCountToday: 0,
        totalFailed: 0,
        totalSuccess: 0,
        lastResetDate: new Date().toISOString().slice(0, 10)
      };

      history.successCountToday += 1;
      history.totalSuccess += 1;
      draft.loginHistory = history;
      return draft;
    });

    logAdminEvent("LAST_LOGIN_UPDATED", `Metadata login diperbarui (IP: ${ip}, Remember: ${remember})`);
    logAdminEvent("SUCCESS_LOGIN_RECORDED", `Statistik login sukses dicatat untuk IP: ${ip}`);
  },

  recordFailedLogin(ip = "127.0.0.1"): void {
    adminRepository.update((draft) => {
      const history = draft.loginHistory || {
        failedCountToday: 0,
        successCountToday: 0,
        totalFailed: 0,
        totalSuccess: 0,
        lastResetDate: new Date().toISOString().slice(0, 10)
      };

      history.failedCountToday += 1;
      history.totalFailed += 1;
      draft.loginHistory = history;
      return draft;
    });

    logAdminEvent("FAILED_LOGIN_RECORDED", `Statistik kesalahan login dicatat untuk IP: ${ip}`);
  },

  /**
   * Generates sanitized exportable JSON configuration data.
   * NOTE: This exported JSON is structured for seamless import compatibility in roadmap v2.3.
   */
  exportConfiguration(): ServiceResult<{ filename: string; content: string }> {
    const state = adminRepository.read();
    const snapshots = adminSnapshotRepository.read();

    const exportData = {
      $schema: "https://hajat.portfolio/schemas/admin-config-v2.2.json",
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: state.auth.username,
        version: "v2.2.0-RC1",
        snapshotCount: snapshots.length
      },
      configuration: {
        username: state.auth.username,
        toggles: state.toggles,
        strategies: state.strategies,
        stats: state.stats
      }
    };

    const content = JSON.stringify(exportData, null, 2);
    const filename = `admin-config-backup-${new Date().toISOString().slice(0, 10)}.json`;

    logAdminEvent("CONFIGURATION_EXPORTED", `Konfigurasi berhasil diexport (${filename})`);

    return {
      success: true,
      data: { filename, content }
    };
  },

  getSecurityOverview(): ServiceResult<{
    lastLogin: any;
    loginHistory: any;
    snapshotCount: number;
    globalEpoch: number;
  }> {
    const state = adminRepository.read();
    const snapshots = adminSnapshotRepository.read();

    return {
      success: true,
      data: {
        lastLogin: state.lastLogin,
        loginHistory: state.loginHistory,
        snapshotCount: snapshots.length,
        globalEpoch: state.globalEpoch
      }
    };
  }
};
