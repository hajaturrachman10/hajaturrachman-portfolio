import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminConfigurationService } from "@/services/admin/adminConfigurationService";
import { adminRepository } from "@/services/admin/adminRepository";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";


export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  await adminRepository.readAsync();
  const result = adminConfigurationService.listSnapshots();

  return NextResponse.json({
    success: true,
    snapshots: result.data
  });
}
