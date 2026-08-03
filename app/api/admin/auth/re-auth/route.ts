import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminSecurityService } from "@/services/admin/adminSecurityService";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  try {
    const body = await request.json();
    const { password } = body || {};

    const result = adminSecurityService.verifySensitiveAction(password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message, code: result.error.code },
        { status: result.error.status }
      );
    }

    return NextResponse.json({
      success: true,
      verified: result.data.verified
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Format payload request tidak valid.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
}
