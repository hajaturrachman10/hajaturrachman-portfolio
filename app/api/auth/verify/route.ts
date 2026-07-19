import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getClientIp,
  checkAuthRateLimit,
  recordFailedAuthAttempt,
  resetAuthRateLimit,
  timingSafeCompare,
  generateSessionToken
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { password, type, action } = body || {};

    // Handle emergency reset request (from 3-tap lock icon) BEFORE checking rate limit
    if (action === "reset") {
      resetAuthRateLimit(ip);
      return NextResponse.json({ success: true, message: "Rate limit reset successfully" });
    }

    const rateLimit = checkAuthRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Akses diblokir sementara karena terlalu banyak percobaan salah. Coba lagi dalam ${rateLimit.remainingSeconds} detik.`
        },
        { status: 429 }
      );
    }

    if (!type || !password || typeof password !== "string" || password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Kata sandi dan tipe tidak valid." },
        { status: 400 }
      );
    }

    let isValid = false;
    let cookieName = "";

    const cleanInput = password.trim();

    if (type === "cv") {
      const expectedPassword = (process.env.CV_PASSWORD || "cvhajat2026").trim();
      isValid = timingSafeCompare(cleanInput, expectedPassword);
      cookieName = "cv_unlocked";
    } else if (type === "private-vault") {
      const expectedPassword = (process.env.PRIVATE_VAULT_PASSWORD || "hajatprivat2026").trim();
      isValid = timingSafeCompare(cleanInput, expectedPassword);
      cookieName = "vault_unlocked";
    } else if (type === "ecl-material") {
      const allowedEclPasswords = Array.from(
        { length: 2026 - 2006 + 1 },
        (_, i) => `10juli${2006 + i}`
      );

      isValid = allowedEclPasswords.some((allowed) => timingSafeCompare(cleanInput, allowed));
      cookieName = "ecl_unlocked";
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe autentikasi tidak dikenal." },
        { status: 400 }
      );
    }

    if (isValid) {
      resetAuthRateLimit(ip);
      const token = generateSessionToken(type);

      cookies().set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 hari
      });

      return NextResponse.json({ success: true });
    }

    const failedRecord = recordFailedAuthAttempt(ip);

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
