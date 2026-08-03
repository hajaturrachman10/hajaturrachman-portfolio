import { ADMIN_CONFIG } from "./adminConfig";
import { FeatureType } from "./adminTypes";

export const adminValidator = {
  validateUsername(username?: string): boolean {
    if (!username || typeof username !== "string") return false;
    return username.trim().length >= 3;
  },

  validatePassword(password?: string): boolean {
    if (!password || typeof password !== "string") return false;
    return password.length >= 8;
  },

  validateFeature(feature?: string): feature is FeatureType {
    if (!feature) return false;
    return (ADMIN_CONFIG.FEATURES as readonly string[]).includes(feature);
  },

  validateEpoch(sessionEpoch: number, currentGlobalEpoch: number): boolean {
    return sessionEpoch >= currentGlobalEpoch;
  }
};
