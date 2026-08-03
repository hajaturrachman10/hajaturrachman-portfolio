import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminSecurityService } from "@/services/admin/adminSecurityService";
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

  const result = adminSecurityService.exportConfiguration();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.message, code: result.error.code },
      { status: result.error.status }
    );
  }

  return new NextResponse(result.data.content, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.data.filename}"`
    }
  });
}
