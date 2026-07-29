import { timingSafeCompare } from "@/lib/security";

export const eclService = {
  verifyMaterialPassword(password: string): boolean {
    const cleanInput = password.trim();
    const allowedEclPasswords = Array.from(
      { length: 2026 - 2006 + 1 },
      (_, i) => `10juli${2006 + i}`
    );

    return allowedEclPasswords.some((allowed) => timingSafeCompare(cleanInput, allowed));
  }
};
