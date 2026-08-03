import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";
import { getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;
  const clientIp = getClientIp(request);

  adminAuthService.logout(token, clientIp);

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_CONFIG.COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0
  });

  return response;
}
