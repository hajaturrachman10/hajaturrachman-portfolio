import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { adminConfigurationService } from "./adminConfigurationService";
import { ADMIN_ERRORS } from "./adminErrors";
import { logAdminEvent } from "./adminAuditLogger";
import { FeatureType, FeatureToggleState, ServiceResult } from "./adminTypes";

export const adminToggleService = {
  getFeatureState(feature: FeatureType): ServiceResult<FeatureToggleState> {
    if (!adminValidator.validateFeature(feature)) {
      return { success: false, error: ADMIN_ERRORS.FEATURE_NOT_FOUND };
    }

    const state = adminRepository.read();
    return {
      success: true,
      data: state.toggles[feature]
    };
  },

  getAllFeatureStates(): ServiceResult<Record<FeatureType, FeatureToggleState>> {
    const state = adminRepository.read();
    return {
      success: true,
      data: state.toggles
    };
  },

  toggleFeature(feature: FeatureType, protectedStatus: boolean): ServiceResult<{ feature: FeatureType; protected: boolean; globalEpoch: number }> {
    if (!adminValidator.validateFeature(feature)) {
      return { success: false, error: ADMIN_ERRORS.FEATURE_NOT_FOUND };
    }

    // Capture snapshot before modifying config
    const current = adminRepository.read();
    adminConfigurationService.createSnapshot(
      current.auth.username,
      `Perubahan Toggle ${feature.toUpperCase()} ke ${protectedStatus ? "PROTECTED" : "UNPROTECTED"}`
    );

    const now = Date.now();
    const updatedState = adminRepository.update((draft) => {
      const wasProtected = draft.toggles[feature]?.protected;
      draft.toggles[feature] = {
        protected: protectedStatus,
        updatedAt: now
      };

      if (!wasProtected && protectedStatus && (feature === "cv" || feature === "vault" || feature === "ecl")) {
        draft.globalEpoch = now;
      }
      return draft;
    });

    logAdminEvent(
      "TOGGLE_CHANGED",
      `Fitur ${feature} diubah menjadi ${protectedStatus ? "PROTECTED (ON)" : "UNPROTECTED (OFF)"}`
    );

    return {
      success: true,
      data: {
        feature,
        protected: protectedStatus,
        globalEpoch: updatedState.globalEpoch
      }
    };
  },

  enableFeature(feature: FeatureType): ServiceResult<{ feature: FeatureType; protected: boolean; globalEpoch: number }> {
    return this.toggleFeature(feature, true);
  },

  disableFeature(feature: FeatureType): ServiceResult<{ feature: FeatureType; protected: boolean; globalEpoch: number }> {
    return this.toggleFeature(feature, false);
  },

  revokeAllPublicSessions(): ServiceResult<{ globalEpoch: number }> {
    const current = adminRepository.read();
    adminConfigurationService.createSnapshot(
      current.auth.username,
      "Pembatalan Sesi Publik Global (Global Epoch Update)"
    );

    const now = Date.now();
    const updatedState = adminRepository.update((draft) => {
      draft.globalEpoch = now;
      return draft;
    });

    logAdminEvent("TOGGLE_CHANGED", "Seluruh sesi publik dibatalkan secara global (Epoch Revocation)");

    return {
      success: true,
      data: { globalEpoch: updatedState.globalEpoch }
    };
  }
};
