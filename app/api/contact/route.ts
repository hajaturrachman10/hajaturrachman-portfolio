import { NextResponse } from "next/server";
import { contactService } from "@/services/contactService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const ip = contactService.getClientIp(request);
    if (!contactService.checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Batas 3 kali pengiriman pesan per jam tercapai demi mencegah spam." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = contactService.validateContactInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const result = await contactService.processContactMessage(body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
