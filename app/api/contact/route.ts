import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getClientIp, checkContactRateLimit } from "@/lib/security";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkContactRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Batas 3 kali pengiriman pesan per jam tercapai demi mencegah spam." },
        { status: 429 }
      );
    }

    const { name, email, message } = await request.json();

    if (!name || !email || !message || name.length > 100 || email.length > 100 || message.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan pesan wajib diisi dengan panjang yang wajar." },
        { status: 400 }
      );
    }

    const payload = {
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    };

    let savedToSupabase = false;
    let sentToTelegram = false;
    let sentToResend = false;
    let savedToLocal = false;

    // 1. Coba simpan ke Supabase (jika terkonfigurasi)
    if (supabase) {
      try {
        const { error } = await supabase.from("contacts").insert([payload]);
        if (!error) {
          savedToSupabase = true;
        } else {
          console.warn("Supabase insert error:", error);
        }
      } catch (err) {
        console.error("Gagal menyimpan ke Supabase:", err);
      }
    }

    // 2. Coba kirim via Telegram Bot (jika terkonfigurasi)
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId) {
      try {
        const text = `📬 *Pesan Kontak Baru*\n\n*Nama:* ${name}\n*Email:* ${email}\n\n*Pesan:*\n${message}`;
        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "Markdown",
          }),
        });
        if (response.ok) {
          sentToTelegram = true;
        }
      } catch (err) {
        console.error("Gagal mengirim notifikasi Telegram:", err);
      }
    }

    // 3. Coba kirim via Resend (jika terkonfigurasi)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: process.env.CONTACT_RECEIVER_EMAIL || "Hajaturrachman2006@gmail.com",
            subject: `Pesan Baru Portofolio: ${name}`,
            html: `
              <h3>Pesan Kontak Baru</h3>
              <p><strong>Nama:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Pesan:</strong></p>
              <p>${message.replace(/\n/g, "<br>")}</p>
            `,
          }),
        });
        if (response.ok) {
          sentToResend = true;
        }
      } catch (err) {
        console.error("Gagal mengirim email via Resend:", err);
      }
    }

    // 4. Selalu simpan ke local file sebagai fallback/arsip (untuk pengembangan lokal)
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "messages.json");
      let messages = [];
      if (fs.existsSync(filePath)) {
        try {
          messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          messages = [];
        }
      }
      messages.unshift({ id: Date.now().toString(), ...payload });
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");
      savedToLocal = true;
    } catch (err) {
      console.error("Gagal menyimpan ke arsip lokal:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dikirim!",
      details: {
        supabase: savedToSupabase,
        telegram: sentToTelegram,
        resend: sentToResend,
        local: savedToLocal,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
