import fs from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/security";
import { adminRepository } from "@/services/admin/adminRepository";

export const cvService = {
  async getCVFileAsync(token?: string, download = false) {
    await adminRepository.readAsync();
    return this.getCVFile(token, download);
  },

  getCVFile(token?: string, download = false) {

    const isUnlocked = verifySessionToken(token, "cv");
    if (!isUnlocked) {
      return { success: false as const, status: 401, error: "Akses ditolak. Silakan masukkan kata sandi terlebih dahulu." };
    }

    const filePath = path.join(process.cwd(), "public", "docs", "Hajaturrachman-CV.pdf");

    if (!fs.existsSync(filePath)) {
      return { success: false as const, status: 404, error: "File CV tidak ditemukan." };
    }

    const fileBuffer = fs.readFileSync(filePath);
    const disposition = download
      ? 'attachment; filename="CV-Hajaturrachman.pdf"'
      : 'inline; filename="CV-Hajaturrachman.pdf"';

    return {
      success: true as const,
      status: 200,
      fileBuffer,
      contentType: "application/pdf",
      disposition
    };
  }
};
