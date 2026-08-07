import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET() {
  const messages = readLocalMessages();
  return NextResponse.json({ success: true, messages });
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
      status: body.status || "unread"
    };

    const updated = [newMsg, ...current.filter((m: any) => m.id !== newMsg.id)];
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: newMsg, messages: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menyimpan pesan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const current = readLocalMessages();
    const updated = current.map((m: any) => (m.id === id ? { ...m, status } : m));

    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updated, null, 2), "utf-8");
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

    const current = readLocalMessages();
    const updated = current.filter((m: any) => m.id !== id);

    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ success: true, messages: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
