import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const cvToken = cookies().get("cv_unlocked")?.value;
  const vaultToken = cookies().get("vault_unlocked")?.value;
  const eclToken = cookies().get("ecl_unlocked")?.value;

  return NextResponse.json({
    cvUnlocked: verifySessionToken(cvToken, "cv"),
    vaultUnlocked: verifySessionToken(vaultToken, "private-vault"),
    eclUnlocked: verifySessionToken(eclToken, "ecl-material"),
  });
}
