import { adminRepository } from "./adminRepository";
import { adminValidator } from "./adminValidator";
import { evaluatePasswordStrategy, validateStrategyConfig, PasswordStrategyConfig } from "./passwordEngine";
import { ADMIN_ERRORS } from "./adminErrors";
import { logAdminEvent } from "./adminAuditLogger";
import { MainFeatureType, ServiceResult } from "./adminTypes";

export const adminStrategyService = {
  getStrategies(): ServiceResult<Record<MainFeatureType, PasswordStrategyConfig>> {
    const state = adminRepository.read();
    return {
      success: true,
      data: state.strategies
    };
  },

  updateStrategy(feature: MainFeatureType, strategy: PasswordStrategyConfig): ServiceResult<{ feature: MainFeatureType; strategy: PasswordStrategyConfig }> {
    if (!adminValidator.validateFeature(feature)) {
      return { success: false, error: ADMIN_ERRORS.FEATURE_NOT_FOUND };
    }

    const validation = validateStrategyConfig(strategy);
    if (!validation.valid) {
      return {
        success: false,
        error: { code: "INVALID_STRATEGY", message: validation.error || "Konfigurasi strategi tidak valid.", status: 400 }
      };
    }

    adminRepository.update((draft) => {
      draft.strategies[feature] = strategy;
      return draft;
    });

    logAdminEvent("SETTINGS_UPDATED", `Strategi password untuk ${feature.toUpperCase()} diperbarui ke ${strategy.type}`);

    return {
      success: true,
      data: { feature, strategy }
    };
  },

  testPasswordStrategy(inputPassword: string, strategy: PasswordStrategyConfig): ServiceResult<{ valid: boolean }> {
    const validation = validateStrategyConfig(strategy);
    if (!validation.valid) {
      return {
        success: false,
        error: { code: "INVALID_STRATEGY", message: validation.error || "Konfigurasi strategi tidak valid.", status: 400 }
      };
    }

    const isValid = evaluatePasswordStrategy(inputPassword, strategy);
    return {
      success: true,
      data: { valid: isValid }
    };
  }
};
