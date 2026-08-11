import { privateVaultData } from "@/data/privateVaultServer";
import { verifySessionToken } from "@/lib/security";
import { adminRepository } from "@/services/admin/adminRepository";

export const vaultService = {
  async getVaultContentAsync(token?: string) {
    await adminRepository.readAsync();
    return this.getVaultContent(token);
  },

  getVaultContent(token?: string) {
    // Read the live toggle state from server-side repository (never from client cookie)
    const adminState = adminRepository.read();
    const isVaultProtected = adminState.toggles?.vault?.protected ?? true;

    // If admin has unprotected Vault (toggle OFF) — allow direct access without any token
    if (!isVaultProtected) {
      return {
        success: true as const,
        data: privateVaultData
      };
    }

    // Vault is protected — require a valid session token
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
