import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = cookies().get("cv_unlocked")?.value;
  const isUnlocked = verifySessionToken(token, "cv");

  if (!isUnlocked) {
    return new Response("Akses ditolak. Silakan masukkan kata sandi terlebih dahulu.", { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "Hajaturrachman-CV.pdf");

    if (!fs.existsSync(filePath)) {
      return new Response("File CV tidak ditemukan.", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    if (download) {
      headers.set("Content-Disposition", 'attachment; filename="CV-Hajaturrachman.pdf"');
    } else {
      headers.set("Content-Disposition", 'inline; filename="CV-Hajaturrachman.pdf"');
    }

    return new Response(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Gagal memproses file CV.", { status: 500 });
  }
}
