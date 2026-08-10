import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { vaultService } from "@/services/vaultService";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get("vault_unlocked")?.value;
  const result = await vaultService.getVaultContentAsync(token);


  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: result.data
  });
}
