import { cookies } from "next/headers";
import { cvService } from "@/services/cvService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = cookies().get("cv_unlocked")?.value;
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "true";

  const result = await cvService.getCVFileAsync(token, download);


  if (!result.success) {
    return new Response(result.error, { status: result.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", result.contentType);
  headers.set("Content-Disposition", result.disposition);
  headers.set("Cache-Control", "no-store, max-age=0");

  return new Response(new Uint8Array(result.fileBuffer), {
    status: result.status,
    headers
  });
}
