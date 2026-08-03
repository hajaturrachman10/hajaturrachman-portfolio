import { NextResponse } from "next/server";
import { clearAllAuthRateLimits } from "@/lib/security";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "Dev reset hanya tersedia pada mode development." },
      { status: 403 }
    );
  }

  clearAllAuthRateLimits();

  return NextResponse.json({
    success: true,
    message: "Seluruh pembekuan rate-limit berhasil di-reset (Development Only)."
  });
}
