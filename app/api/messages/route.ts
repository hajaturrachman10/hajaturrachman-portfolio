import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

function readLocalMessages(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((m: any) => ({
          id: m.id || String(Date.now()),
          name: m.name || "Anonim",
          email: m.email || "-",
          subject: m.subject || `Pesan dari ${m.name || "Pengunjung"}`,
          message: m.message || "",
          timestamp: m.created_at || m.timestamp || new Date().toISOString(),
          status: m.status || "unread"
        }));
      }
    }
  } catch (err) {
    console.error("Error reading messages file:", err);
  }
  return [];
}

function writeLocalMessages(messages: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing messages file:", err);
  }
}

export async function GET() {
  const localMsgs = readLocalMessages();
  let remoteMsgs: any[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteMsgs = data.map((m: any) => ({
          id: m.id || `msg-${new Date(m.created_at || Date.now()).getTime()}`,
          name: m.name || "Anonim",
          email: m.email || "-",
          subject: m.subject || `Pesan Kontak dari ${m.name || "Pengunjung"}`,
          message: m.message || "",
          timestamp: m.created_at || m.timestamp || new Date().toISOString(),
          status: m.status || "unread"
        }));
      }
    } catch (err) {
      console.error("Error fetching messages from Supabase:", err);
    }
  }

  // Deduplicate and merge remote + local messages safely
  const map = new Map<string, any>();
  for (const m of localMsgs) {
    if (m && m.id) map.set(m.id, m);
  }
  for (const m of remoteMsgs) {
    if (m && m.id) {
      const existing = map.get(m.id);
      map.set(m.id, existing ? { ...m, status: existing.status || m.status } : m);
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  writeLocalMessages(merged);
  return NextResponse.json({ success: true, messages: merged });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readLocalMessages();

    const newMsg = {
      id: body.id || `msg-${Date.now()}`,
      name: body.name,
      email: body.email,
      subject: body.subject || `Pesan Kontak: ${body.name}`,
      message: body.message,
      timestamp: body.timestamp || new Date().toISOString(),
      created_at: body.timestamp || new Date().toISOString(),
      status: body.status || "unread"
    };

    if (supabase) {
      try {
        await supabase.from("contacts").insert([newMsg]);
      } catch (err) {
        console.error("Gagal menyimpan ke Supabase:", err);
      }
    }

    const updated = [newMsg, ...current.filter((m: any) => m.id !== newMsg.id)];
    writeLocalMessages(updated);

    return NextResponse.json({ success: true, message: newMsg, messages: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menyimpan pesan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (supabase && id) {
      try {
        await supabase.from("contacts").update({ status }).eq("id", id);
      } catch (err) {
        console.error("Gagal memperbarui status di Supabase:", err);
      }
    }

    const current = readLocalMessages();
    const updated = current.map((m: any) => (m.id === id ? { ...m, status } : m));
    writeLocalMessages(updated);

    return NextResponse.json({ success: true, messages: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal memperbarui status pesan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID pesan wajib diisi" }, { status: 400 });
    }

    if (supabase) {
      try {
        await supabase.from("contacts").delete().eq("id", id);
      } catch (err) {
        console.error("Gagal menghapus pesan dari Supabase:", err);
      }
    }

    const current = readLocalMessages();
    const updated = current.filter((m: any) => m.id !== id);
    writeLocalMessages(updated);

    return NextResponse.json({ success: true, messages: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
