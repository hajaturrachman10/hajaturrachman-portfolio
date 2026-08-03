import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminStatsService } from "@/services/admin/adminStatsService";
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

  const result = adminStatsService.getStatistics();

  return NextResponse.json({
    success: true,
    stats: result.data
  });
}
