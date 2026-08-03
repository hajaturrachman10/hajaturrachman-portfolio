import {
  getClientIp,
  checkAuthRateLimit,
  recordFailedAuthAttempt,
  resetAuthRateLimit,
  timingSafeCompare,
  generateSessionToken,
  verifySessionToken
} from "@/lib/security";
import { adminRepository } from "@/services/admin/adminRepository";
import { evaluatePasswordStrategy } from "@/services/admin/passwordEngine";
import { MainFeatureType } from "@/services/admin/adminTypes";

export type AuthType = "cv" | "private-vault" | "ecl-material";

function mapAuthTypeToFeatureKey(type: AuthType): MainFeatureType {
  if (type === "private-vault") return "vault";
  if (type === "ecl-material") return "ecl";
  return "cv";
}

export const authService = {
  getClientIp,
  checkRateLimit: (ip: string) => checkAuthRateLimit(ip),
  resetRateLimit: (ip: string) => resetAuthRateLimit(ip),
  recordFailedAttempt: (ip: string) => recordFailedAuthAttempt(ip),

  verifyPassword(type: AuthType, password: string): { isValid: boolean; cookieName: string } {
    const featureKey = mapAuthTypeToFeatureKey(type);
    const cookieName =
      type === "cv"
        ? "cv_unlocked"
        : type === "private-vault"
        ? "vault_unlocked"
        : "ecl_unlocked";

    try {
      const state = adminRepository.read();
      const strategyConfig = state.strategies[featureKey];

      if (strategyConfig) {
        const isValid = evaluatePasswordStrategy(password, strategyConfig);
        return { isValid, cookieName };
      }
    } catch {
      // Fallback if strategy read fails
    }

    // Default Fallback
    let isValid = false;
    const cleanInput = password.trim();
    if (type === "cv") {
      isValid = timingSafeCompare(cleanInput, "cvhajat2026");
    } else if (type === "private-vault") {
      isValid = timingSafeCompare(cleanInput, "hajatprivat2026");
    } else if (type === "ecl-material") {
      const allowed = Array.from({ length: 2026 - 2006 + 1 }, (_, i) => `10juli${2006 + i}`);
      isValid = allowed.some((a) => timingSafeCompare(cleanInput, a));
    }

    return { isValid, cookieName };
  },

  createSessionToken(type: AuthType): string {
    return generateSessionToken(type);
  },

  getAuthStatus(cvToken?: string, vaultToken?: string, eclToken?: string) {
    let adminState;
    try {
      adminState = adminRepository.read();
    } catch {
      adminState = null;
    }

    return {
      cvUnlocked: verifySessionToken(cvToken, "cv"),
      vaultUnlocked: verifySessionToken(vaultToken, "private-vault"),
      eclUnlocked: verifySessionToken(eclToken, "ecl-material"),
      overrides: {
        cv: adminState ? !adminState.toggles?.cv?.protected : false,
        vault: adminState ? !adminState.toggles?.vault?.protected : false,
        ecl: adminState ? !adminState.toggles?.ecl?.protected : false
      },
      docToggles: {
        doc1: adminState ? (adminState.toggles?.ecl_doc1?.protected ?? true) : true,
        doc2: adminState ? (adminState.toggles?.ecl_doc2?.protected ?? true) : true,
        doc3: adminState ? (adminState.toggles?.ecl_doc3?.protected ?? true) : true
      }
    };
  }
};
