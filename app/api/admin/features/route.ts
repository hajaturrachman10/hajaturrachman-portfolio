import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminToggleService } from "@/services/admin/adminToggleService";
import { adminRepository } from "@/services/admin/adminRepository";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";

export async function GET() {
  const result = adminToggleService.getAllFeatureStates();
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.message, code: result.error.code },
      { status: result.error.status }
    );
  }

  return NextResponse.json({
    success: true,
    toggles: result.data
  });
}

export async function PATCH(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  try {
    const body = await request.json();
    const { feature, protected: protectedStatus } = body || {};

    const toggleResult = adminToggleService.toggleFeature(feature, Boolean(protectedStatus));

    if (!toggleResult.success) {
      return NextResponse.json(
        { success: false, error: toggleResult.error.message, code: toggleResult.error.code },
        { status: toggleResult.error.status }
      );
    }

    const allToggles = adminToggleService.getAllFeatureStates();
    const togglesMap: Record<string, boolean> = {};
    if (allToggles.success && allToggles.data) {
      Object.keys(allToggles.data).forEach((key) => {
        togglesMap[key] = allToggles.data[key as keyof typeof allToggles.data].protected;
      });
    }

    const latestState = adminRepository.read();

    const response = NextResponse.json({
      success: true,
      data: toggleResult.data,
      togglesMap
    });

    try {
      const togglesPayload = JSON.stringify({
        toggles: latestState.toggles,
        globalEpoch: latestState.globalEpoch
      });
      response.cookies.set("hajat_toggles_state", encodeURIComponent(togglesPayload), {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 31536000
      });
    } catch {
      // Fallback: set unencoded JSON if stringify fails
      response.cookies.set("hajat_toggles_state", JSON.stringify(togglesMap), {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 31536000
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Format payload request tidak valid.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
}
