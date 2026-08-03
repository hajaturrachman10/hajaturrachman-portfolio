import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const result = adminAuthService.validateSession(token);

  if (!result.success) {
    return NextResponse.json(
      { authenticated: false, error: result.error.message, code: result.error.code },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: result.data.session.username,
    expiresAt: result.data.session.expiresAt
  });
}
