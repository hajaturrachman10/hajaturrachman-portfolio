import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export const dynamic = "force-dynamic";

export async function GET() {
  const cvToken = cookies().get("cv_unlocked")?.value;
  const vaultToken = cookies().get("vault_unlocked")?.value;
  const eclToken = cookies().get("ecl_unlocked")?.value;

  const status = authService.getAuthStatus(cvToken, vaultToken, eclToken);

  return NextResponse.json(status);
}
