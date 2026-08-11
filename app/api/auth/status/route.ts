import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const cvToken = cookies().get("cv_unlocked")?.value;
  const vaultToken = cookies().get("vault_unlocked")?.value;
  const eclToken = cookies().get("ecl_unlocked")?.value;

  // SECURITY: togglesCookie is no longer passed to the service.
  // Toggle state is read exclusively from server-side adminRepository (Supabase/GlobalThis cache).
  // This prevents client-side cookie manipulation attacks.
  const status = await authService.getAuthStatusAsync(cvToken, vaultToken, eclToken);

  const response = NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });

  // Propagate the authoritative toggle state back as a cookie for client-side UI sync.
  // This is safe: we WRITE the server's authoritative state TO the cookie (not the other way around).
  // The client reads this to update UI (BroadcastChannel, etc.) — the server never trusts it back.
  if (status.toggles) {
    try {
      const togglesPayload = JSON.stringify({ toggles: status.toggles, globalEpoch: status.globalEpoch });
      response.cookies.set("hajat_toggles_state", encodeURIComponent(togglesPayload), {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: false // Must be readable by client-side for UI sync only
      });
    } catch {
      // Ignore if cookie setting fails
    }
  }

  return response;
}
