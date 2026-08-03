import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authService, type AuthType } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const ip = authService.getClientIp(request);
    const body = await request.json();
    const { password, type, action } = body || {};

    // Handle emergency reset request
    if (action === "reset") {
      authService.resetRateLimit(ip);
      return NextResponse.json({ success: true, message: "Rate limit reset successfully" });
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

    const { isValid, cookieName } = authService.verifyPassword(type as AuthType, password);

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
