import { NextResponse } from "next/server";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";
import { getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, remember } = body || {};
    const clientIp = getClientIp(request);

    const result = adminAuthService.authenticate(username, password, Boolean(remember), clientIp);

    if (!result.success) {
      const details = (result.error as any).details || {};
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          code: result.error.code,
          remainingAttempts: details.remainingAttempts,
          remainingSeconds: details.remainingSeconds,
          usernameValid: details.usernameValid,
          passwordValid: details.passwordValid
        },
        { status: result.error.status }
      );
    }

    const { token, session } = result.data;
    const maxAge = remember
      ? ADMIN_CONFIG.SESSION_DURATION_REMEMBER / 1000
      : ADMIN_CONFIG.SESSION_DURATION_DEFAULT / 1000;

    const response = NextResponse.json({
      success: true,
      user: session.username,
      expiresAt: session.expiresAt
    });

    response.cookies.set({
      name: ADMIN_CONFIG.COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Format request tidak valid.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
}
