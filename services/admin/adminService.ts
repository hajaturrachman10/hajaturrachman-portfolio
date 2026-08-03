import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { ADMIN_ERRORS } from "./adminErrors";
import { FeatureType, AdminState, AdminStats } from "./adminTypes";

export const adminService = {
  getState(): AdminState {
    return adminRepository.read();
  },

  updateToggle(feature: FeatureType, protectedStatus: boolean): { success: boolean; state: AdminState } {
    if (!adminValidator.validateFeature(feature)) {
      throw new Error(ADMIN_ERRORS.FEATURE_NOT_FOUND.message);
    }

    const updatedState = adminRepository.update((draft) => {
      const now = Date.now();
      draft.toggles[feature] = {
        protected: protectedStatus,
        updatedAt: now
      };
      if (protectedStatus) {
        // Live Sync: Invalidates existing public sessions if toggle turns ON
        draft.globalEpoch = now;
      }
      return draft;
    });

    return { success: true, state: updatedState };
  },

  revokeSessions(): { success: boolean; globalEpoch: number } {
    const now = Date.now();
    const updatedState = adminRepository.update((draft) => {
      draft.globalEpoch = now;
      return draft;
    });

    return { success: true, globalEpoch: updatedState.globalEpoch };
  },

  incrementStat(metric: keyof AdminStats): AdminStats {
    const updatedState = adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] += 1;
      }
      return draft;
    });

    return updatedState.stats;
  },

  getStatistics(): AdminStats {
    const state = adminRepository.read();
    return state.stats;
  }
};
