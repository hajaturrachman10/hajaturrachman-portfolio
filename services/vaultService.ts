import { privateVaultData } from "@/data/privateVaultServer";
import { verifySessionToken } from "@/lib/security";
import { adminRepository } from "@/services/admin/adminRepository";

export const vaultService = {
  async getVaultContentAsync(token?: string) {
    await adminRepository.readAsync();
    return this.getVaultContent(token);
  },

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
