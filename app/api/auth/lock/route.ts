import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type } = await request.json();

    if (type === "cv") {
      cookies().delete("cv_unlocked");
    } else if (type === "private-vault") {
      cookies().delete("vault_unlocked");
    } else if (type === "ecl-material") {
      cookies().delete("ecl_unlocked");
    } else {
      cookies().delete("cv_unlocked");
      cookies().delete("vault_unlocked");
      cookies().delete("ecl_unlocked");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
