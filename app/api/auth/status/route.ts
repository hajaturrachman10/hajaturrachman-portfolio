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

  const status = await authService.getAuthStatusAsync(cvToken, vaultToken, eclToken, togglesCookie);


  const response = NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });

  // Propagate the authoritative toggle state back as a cookie.
  // This ensures consistency across serverless containers — any container that
  // serves the correct state will write it to the user's cookie, so subsequent
  // requests to any container will have the correct state via cookie LWW.
  if (status.toggles) {
    try {
      const togglesPayload = JSON.stringify({ toggles: status.toggles, globalEpoch: status.globalEpoch });
      response.cookies.set("hajat_toggles_state", encodeURIComponent(togglesPayload), {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: false // Must be readable by client-side syncLocalToggles
      });
    } catch {
      // Ignore if cookie setting fails
    }
  }

  return response;
}
