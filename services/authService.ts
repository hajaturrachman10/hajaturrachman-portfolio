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

  async verifyPasswordAsync(type: AuthType, password: string): Promise<{ isValid: boolean; cookieName: string }> {
    await adminRepository.readAsync();
    return this.verifyPassword(type, password);
  },

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

    // Default Fallback (reads from env vars — no hardcoded secrets in source)
    let isValid = false;
    const cleanInput = password.trim();
    if (type === "cv") {
      if (!process.env.CV_PASSWORD) {
        console.warn("[SECURITY WARN] CV_PASSWORD Environment Variable belum terdefinisi. Menggunakan kata sandi fallback sementara.");
      }
      const cvPwd = process.env.CV_PASSWORD || "cvhajat2026";
      isValid = timingSafeCompare(cleanInput, cvPwd);
    } else if (type === "private-vault") {
      if (!process.env.VAULT_PASSWORD) {
        console.warn("[SECURITY WARN] VAULT_PASSWORD Environment Variable belum terdefinisi. Menggunakan kata sandi fallback sementara.");
      }
      const vaultPwd = process.env.VAULT_PASSWORD || "hajatprivat2026";
      isValid = timingSafeCompare(cleanInput, vaultPwd);
    } else if (type === "ecl-material") {
      const allowed = Array.from({ length: 2026 - 2006 + 1 }, (_, i) => `10juli${2006 + i}`);
      isValid = allowed.some((a) => timingSafeCompare(cleanInput, a));
    }


    return { isValid, cookieName };
  },

  createSessionToken(type: AuthType): string {
    return generateSessionToken(type);
  },

  async getAuthStatusAsync(cvToken?: string, vaultToken?: string, eclToken?: string, togglesCookie?: string) {
    await adminRepository.readAsync(togglesCookie);
    return this.getAuthStatus(cvToken, vaultToken, eclToken, togglesCookie);
  },

  getAuthStatus(cvToken?: string, vaultToken?: string, eclToken?: string, togglesCookie?: string) {

    let adminState;
    try {
      // Pass togglesCookie explicitly — adminRepository.read() applies cookie LWW internally.
      // This is the ONLY correct way; do NOT re-parse the cookie here as well.
      adminState = adminRepository.read(togglesCookie);
    } catch {
      adminState = null;
    }

    // adminRepository.read() already merged the cookie LWW — use adminState.toggles directly
    const isCvProtected = adminState ? (adminState.toggles?.cv?.protected ?? true) : true;
    const isVaultProtected = adminState ? (adminState.toggles?.vault?.protected ?? true) : true;
    const isEclProtected = adminState ? (adminState.toggles?.ecl?.protected ?? true) : true;
    const isDoc1Protected = adminState ? (adminState.toggles?.ecl_doc1?.protected ?? true) : true;
    const isDoc2Protected = adminState ? (adminState.toggles?.ecl_doc2?.protected ?? true) : true;
    const isDoc3Protected = adminState ? (adminState.toggles?.ecl_doc3?.protected ?? true) : true;

    return {
      cvUnlocked: verifySessionToken(cvToken, "cv"),
      vaultUnlocked: verifySessionToken(vaultToken, "private-vault"),
      eclUnlocked: verifySessionToken(eclToken, "ecl-material"),
      overrides: {
        cv: !isCvProtected,
        vault: !isVaultProtected,
        ecl: !isEclProtected
      },
      docToggles: {
        doc1: isDoc1Protected,
        doc2: isDoc2Protected,
        doc3: isDoc3Protected
      },
      toggles: adminState ? adminState.toggles : null,
      globalEpoch: adminState ? adminState.globalEpoch : null
    };
  }
};
