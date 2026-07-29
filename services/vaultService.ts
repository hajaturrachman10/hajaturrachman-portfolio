import { privateVaultData } from "@/data/privateVaultServer";
import { verifySessionToken } from "@/lib/security";

export const vaultService = {
  getVaultContent(token?: string) {
    const isUnlocked = verifySessionToken(token, "private-vault");
    if (!isUnlocked) {
      return { success: false as const, error: "Akses ditolak. Silakan masukkan kata sandi terlebih dahulu." };
    }

    return {
      success: true as const,
      data: privateVaultData
    };
  }
};
