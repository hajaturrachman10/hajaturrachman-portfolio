import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { privateVaultData } from "@/data/privateVaultServer";
import { verifySessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get("vault_unlocked")?.value;
  const isUnlocked = verifySessionToken(token, "private-vault");

  if (!isUnlocked) {
    return NextResponse.json({ success: false, error: "Akses ditolak. Silakan masukkan kata sandi terlebih dahulu." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: privateVaultData,
  });
}
