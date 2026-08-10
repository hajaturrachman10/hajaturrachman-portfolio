import { NextResponse } from "next/server";
import { adminSecurityService } from "@/services/admin/adminSecurityService";
import { adminConfigurationService } from "@/services/admin/adminConfigurationService";
import { adminRepository } from "@/services/admin/adminRepository";

export async function GET(request: Request) {
  return handleBackupCron(request);
}

export async function POST(request: Request) {
  return handleBackupCron(request);
}

async function handleBackupCron(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";

    // Security check: require CRON_SECRET or Vercel Cron header in production
    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}` && searchParams.get("secret") !== cronSecret) {
      return NextResponse.json(
        { success: false, error: "Akses cron tidak diizinkan.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await adminRepository.readAsync();
    const currentState = adminRepository.read();

    // Create automated snapshot in history
    const historyResult = adminConfigurationService.createSnapshot("SYSTEM_CRON", "Automated Daily Configuration Backup", currentState);
    const exportResult = adminSecurityService.exportConfiguration();

    return NextResponse.json({
      success: true,
      message: "Backup otomatis konfigurasi admin berhasil dibuat.",
      timestamp: new Date().toISOString(),
      snapshotVersion: historyResult.success ? historyResult.data.version : null,
      backupFilename: exportResult.success ? exportResult.data.filename : null
    });
  } catch (err) {
    console.error("Gagal menjalankan cron backup otomatis:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal saat cron backup.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
