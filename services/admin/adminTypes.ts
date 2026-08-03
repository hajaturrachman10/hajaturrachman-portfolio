import { PasswordStrategyConfig } from "./passwordEngine";

export type MainFeatureType = "cv" | "vault" | "ecl";
export type FeatureType = MainFeatureType | "ecl_doc1" | "ecl_doc2" | "ecl_doc3";

export type FeatureToggleState = {
  protected: boolean;
  updatedAt: number;
};

export type AdminAuthData = {
  username: string;
  passwordHash: string;
  sessionSecret: string;
  lastPasswordChange: number;
};

export type AdminStats = {
  totalVisitors: number;
  cvUnlocks: number;
  vaultUnlocks: number;
  eclUnlocks: number;
  contactSubmissions: number;
};

export type LastLoginMetadata = {
  time: number;
  ip: string;
  browser: string;
  remember: boolean;
};

export type LoginHistoryStats = {
  failedCountToday: number;
  successCountToday: number;
  totalFailed: number;
  totalSuccess: number;
  lastResetDate: string;
};

export type AdminAccount = {
  id: string;
  username: string;
  passwords: string[];
  role: "SUPER_ADMIN" | "ADMIN" | "AUDITOR";
  createdAt: number;
};

export type AdminState = {
  auth: AdminAuthData;
  accounts?: AdminAccount[];
  strategies: Record<MainFeatureType, PasswordStrategyConfig>;
  toggles: Record<FeatureType, FeatureToggleState>;
  globalEpoch: number;
  stats: AdminStats;
  lastLogin?: LastLoginMetadata;
  loginHistory?: LoginHistoryStats;
};

export type ConfigSnapshot = {
  version: number;
  createdAt: number;
  createdBy: string;
  message: string;
  configHash: string;
  state: AdminState;
};

export type AdminSession = {
  username: string;
  remember: boolean;
  issuedAt: number;
  expiresAt: number;
  globalEpoch: number;
};

export type LockoutState = {
  attempts: number;
  lockoutUntil: number | null;
};

export type ServiceError = {
  code: string;
  message: string;
  status: number;
  details?: Record<string, any>;
};

export type ServiceResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ServiceError };
