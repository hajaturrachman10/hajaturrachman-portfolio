import crypto from "crypto";
import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { adminConfigurationService } from "./adminConfigurationService";
import { ADMIN_ERRORS } from "./adminErrors";
import { logAdminEvent } from "./adminAuditLogger";
import { FeatureType, FeatureToggleState, ServiceResult, ConfigSnapshot, AdminState } from "./adminTypes";

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

    const now = Date.now();
    // 1. First update feature toggle state
    const updatedState = adminRepository.update((draft) => {
      draft.toggles[feature] = {
        protected: protectedStatus,
        updatedAt: now
      };
      return draft;
    });

    // 2. Create snapshot of updated configuration
    adminConfigurationService.createSnapshot(
      updatedState.auth.username || "Hajaturrachman10",
      `Perubahan Toggle ${feature.toUpperCase()} ke ${protectedStatus ? "PROTECTED (ON)" : "UNPROTECTED (OFF)"}`,
      updatedState
    );

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
