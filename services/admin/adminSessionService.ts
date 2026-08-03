import { adminRepository } from "./adminRepository";
import { FeatureType, ServiceResult } from "./adminTypes";
import { logAdminEvent } from "./adminAuditLogger";

export const adminSessionService = {
  revokeAllPublicSessions(): ServiceResult<{ globalEpoch: number }> {
    const now = Date.now();
    const updatedState = adminRepository.update((draft) => {
      draft.globalEpoch = now;
      return draft;
    });

    logAdminEvent("SESSION_REVOKED", "Seluruh sesi publik dibatalkan secara global");

    return {
      success: true,
      data: { globalEpoch: updatedState.globalEpoch }
    };
  },

  revokeAdminSession(): ServiceResult<{ revoked: boolean }> {
    logAdminEvent("SESSION_REVOKED", "Sesi admin dibatalkan secara manual");
    return {
      success: true,
      data: { revoked: true }
    };
  },

  revokeFeatureSessions(feature: FeatureType): ServiceResult<{ feature: FeatureType; globalEpoch: number }> {
    const now = Date.now();
    const updatedState = adminRepository.update((draft) => {
      draft.toggles[feature].updatedAt = now;
      draft.globalEpoch = now;
      return draft;
    });

    logAdminEvent("SESSION_REVOKED", `Sesi publik untuk fitur ${feature} dibatalkan`);

    return {
      success: true,
      data: { feature, globalEpoch: updatedState.globalEpoch }
    };
  },

  getSessionSummary(): ServiceResult<{ globalEpoch: number; lastRevokedAt: number }> {
    const state = adminRepository.read();
    return {
      success: true,
      data: {
        globalEpoch: state.globalEpoch,
        lastRevokedAt: state.globalEpoch
      }
    };
  }
};
