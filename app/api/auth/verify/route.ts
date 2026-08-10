import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authService, type AuthType } from "@/services/authService";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminSecurityService } from "@/services/admin/adminSecurityService";
import { adminRepository } from "@/services/admin/adminRepository";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";

export async function POST(request: Request) {
  try {
    await adminRepository.readAsync();
    const ip = authService.getClientIp(request);
    const body = await request.json();
    const { password, type, action } = body || {};


    // Handle emergency reset request (Secured: Requires valid admin session or admin password)
    if (action === "reset") {
      const cookieStore = cookies();
      const adminToken = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;
      const sessionValid = adminAuthService.validateSession(adminToken).success;
      const passwordValid = password ? adminSecurityService.verifySensitiveAction(password).success : false;

      if (sessionValid || passwordValid) {
        authService.resetRateLimit(ip);
        return NextResponse.json({ success: true, message: "Rate limit reset successfully" });
      }

      return NextResponse.json(
        { success: false, error: "Otorisasi reset rate limit gagal. Sesi atau kata sandi admin diperlukan." },
        { status: 401 }
      );
    }


    const rateLimit = authService.checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Akses diblokir sementara karena terlalu banyak percobaan salah. Coba lagi dalam ${rateLimit.remainingSeconds} detik.`
        },
        { status: 429 }
      );
    }

    if (!type || !password || typeof password !== "string" || !password.trim() || password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Kata sandi dan tipe tidak valid." },
        { status: 400 }
      );
    }

    if (type !== "cv" && type !== "private-vault" && type !== "ecl-material") {
      return NextResponse.json(
        { success: false, error: "Tipe autentikasi tidak dikenal." },
        { status: 400 }
      );
    }

    const { isValid, cookieName } = await authService.verifyPasswordAsync(type as AuthType, password);

    if (isValid) {
      authService.resetRateLimit(ip);
      const token = authService.createSessionToken(type as AuthType);

      cookies().set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 1 hari
      });

      return NextResponse.json({ success: true });
    }

    const failedRecord = authService.recordFailedAttempt(ip);

    if (failedRecord.lockedOut) {
      return NextResponse.json(
        {
          success: false,
          error: "Batas 5 kali percobaan tercapai. Akses dibekukan selama 10 menit demi keamanan."
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Kata sandi salah. Sisa percobaan aman: ${failedRecord.remainingAttempts} kali.`
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan keamanan pada server." },
      { status: 500 }
    );
  }
}
