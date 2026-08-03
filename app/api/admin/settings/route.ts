import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminSettingsService } from "@/services/admin/adminSettingsService";
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

  const result = adminSettingsService.getSettings();
  return NextResponse.json({ success: true, settings: result.data });
}

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
    const { action, value } = body || {};

    if (action === "changePassword") {
      const result = adminSettingsService.changeAdminPassword(value);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error.message, code: result.error.code },
          { status: result.error.status }
        );
      }
      return NextResponse.json({ success: true, message: "Kata sandi admin berhasil diperbarui." });
    }

    if (action === "changeUsername") {
      const result = adminSettingsService.changeAdminUsername(value);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error.message, code: result.error.code },
          { status: result.error.status }
        );
      }
      return NextResponse.json({ success: true, username: result.data.username });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenal.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Format request tidak valid.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
}
