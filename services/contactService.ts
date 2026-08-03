import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { getClientIp, checkContactRateLimit } from "@/lib/security";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export const contactService = {
  getClientIp,
  checkRateLimit: (ip: string) => checkContactRateLimit(ip),

  validateContactInput(payload: Partial<ContactPayload>): { valid: boolean; error?: string } {
    const { name, email, message } = payload;
    if (!name || !email || !message || name.length > 100 || email.length > 100 || message.length > 5000) {
      return { valid: false, error: "Nama, email, dan pesan wajib diisi dengan panjang yang wajar." };
    }
    return { valid: true };
  },

  async processContactMessage(payload: ContactPayload) {
    const dataPayload = {
      ...payload,
      created_at: new Date().toISOString()
    };

    let savedToSupabase = false;
    let sentToTelegram = false;
    let sentToResend = false;
    let savedToLocal = false;

    // 1. Supabase Storage
    if (supabase) {
      try {
        const { error } = await supabase.from("contacts").insert([dataPayload]);
        if (!error) savedToSupabase = true;
      } catch (err) {
        console.error("Gagal menyimpan ke Supabase:", err);
      }
    }

    // 2. Telegram Bot
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId) {
      try {
        const text = `📬 *Pesan Kontak Baru*\n\n*Nama:* ${payload.name}\n*Email:* ${payload.email}\n\n*Pesan:*\n${payload.message}`;
        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: "Markdown" })
        });
        if (response.ok) sentToTelegram = true;
      } catch (err) {
        console.error("Gagal mengirim notifikasi Telegram:", err);
      }
    }

    // 3. Resend Email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: process.env.CONTACT_RECEIVER_EMAIL || "Hajaturrachman2006@gmail.com",
            subject: `Pesan Baru Portofolio: ${payload.name}`,
            html: `
              <h3>Pesan Kontak Baru</h3>
              <p><strong>Nama:</strong> ${payload.name}</p>
              <p><strong>Email:</strong> ${payload.email}</p>
              <p><strong>Pesan:</strong></p>
              <p>${payload.message.replace(/\n/g, "<br>")}</p>
            `
          })
        });
        if (response.ok) sentToResend = true;
      } catch (err) {
        console.error("Gagal mengirim email via Resend:", err);
      }
    }

    // 4. Local File Fallback Storage
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
      messages.unshift({
        id: `msg-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        subject: `Pesan Kontak Baru dari ${payload.name}`,
        message: payload.message,
        timestamp: new Date().toISOString(),
        status: "unread"
      });
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");
      savedToLocal = true;
    } catch (err) {
      console.error("Gagal menyimpan ke arsip lokal:", err);
    }

    return {
      success: true,
      message: "Pesan berhasil dikirim!",
      details: {
        supabase: savedToSupabase,
        telegram: sentToTelegram,
        resend: sentToResend,
        local: savedToLocal
      }
    };
  }
};
