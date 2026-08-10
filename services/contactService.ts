import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

// Use admin client for server-side contact inserts
const supabase = supabaseAdmin;

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
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: "Format alamat email tidak valid." };
    }
    return { valid: true };
  },

  async processContactMessage(payload: ContactPayload) {
    // Use a single deterministic ID with random suffix to prevent collisions
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const dataPayload = {
      id: msgId,
      name: payload.name,
      email: payload.email,
      subject: `Pesan Kontak dari ${payload.name}`,
      message: payload.message,
      timestamp: nowIso,
      created_at: nowIso,
      status: "unread"
    };

    let savedToSupabase = false;
    let sentToTelegram = false;
    let sentToResend = false;
    let savedToLocal = false;
    // canonicalId: prefer Supabase's own returned id (integer/UUID) so DELETE works correctly
    let canonicalId = msgId;

    // 1. Supabase Storage (with 3-level progressive schema fallback, capturing returned id)
    if (supabase) {
      try {
        const { data: insertedFull, error: fullErr } = await supabase
          .from("contacts")
          .insert([dataPayload])
          .select("id")
          .single();

        if (!fullErr && insertedFull?.id) {
          savedToSupabase = true;
          canonicalId = String(insertedFull.id);
        } else {
          // Schema fallback 1: insert standard fields without string id
          const { data: insertedMin, error: minErr } = await supabase
            .from("contacts")
            .insert([{
              name: payload.name,
              email: payload.email,
              subject: `Pesan Kontak dari ${payload.name}`,
              message: payload.message,
              created_at: nowIso,
              status: "unread"
            }])
            .select("id")
            .single();

          if (!minErr) {
            savedToSupabase = true;
            if (insertedMin?.id) canonicalId = String(insertedMin.id);
          } else {
            // Schema fallback 2: Ultra-minimal insert containing only standard core columns (name, email, message, created_at)
            const { data: insertedUltra, error: ultraErr } = await supabase
              .from("contacts")
              .insert([{
                name: payload.name,
                email: payload.email,
                message: payload.message,
                created_at: nowIso
              }])
              .select("id")
              .single();

            if (!ultraErr) {
              savedToSupabase = true;
              if (insertedUltra?.id) canonicalId = String(insertedUltra.id);
            } else {
              console.error("Gagal menyimpan ke Supabase (seluruh 3 fallback gagal):", { fullErr, minErr, ultraErr });
            }
          }
        }
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

    // Helper to sanitize HTML inputs for email template
    const escapeHtml = (str: string) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // 3. Resend Email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const safeName = escapeHtml(payload.name);
        const safeEmail = escapeHtml(payload.email);
        const safeMsg = escapeHtml(payload.message).replace(/\n/g, "<br>");

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
              <p><strong>Nama:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Pesan:</strong></p>
              <p>${safeMsg}</p>
            `
          })
        });
        if (response.ok) sentToResend = true;
      } catch (err) {
        console.error("Gagal mengirim email via Resend:", err);
      }
    }


    // 4. Local File & Serverless /tmp Fallback Storage
    const IS_PRODUCTION = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    const targetDir = IS_PRODUCTION ? "/tmp" : path.join(process.cwd(), "data");
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filePath = path.join(targetDir, "messages.json");
      let messages: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          messages = [];
        }
      }
      messages.unshift({
        id: canonicalId,
        name: payload.name,
        email: payload.email,
        subject: `Pesan Kontak Baru dari ${payload.name}`,
        message: payload.message,
        timestamp: nowIso,
        status: "unread"
      });
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");
      savedToLocal = true;
    } catch (err) {
      console.error("Gagal menyimpan ke file cache fallback:", err);
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
