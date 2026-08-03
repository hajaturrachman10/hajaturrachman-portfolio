import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const cvToken = cookies().get("cv_unlocked")?.value;
  const vaultToken = cookies().get("vault_unlocked")?.value;
  const eclToken = cookies().get("ecl_unlocked")?.value;
  const togglesCookie = cookies().get("hajat_toggles_state")?.value;

  const status = authService.getAuthStatus(cvToken, vaultToken, eclToken, togglesCookie);

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}
