import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminToggleService } from "@/services/admin/adminToggleService";
import { adminRepository } from "@/services/admin/adminRepository";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";


export async function POST() {
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
  const result = adminToggleService.revokeAllPublicSessions();


  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.message, code: result.error.code },
      { status: result.error.status }
    );
  }

  return NextResponse.json({
    success: true,
    globalEpoch: result.data.globalEpoch
  });
}
