import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

const INITIAL_DEMO_MESSAGES = [
  {
    id: "msg-1",
    name: "Sarah Jenkins",
    email: "sarah.j@techrecruiter.com",
    subject: "Penawaran Posisi Senior Fullstack Developer",
    message: "Halo Hajat, kami sangat terkesan dengan portofolio Antigravity dan proyek-proyek AI yang Anda bangun. Kami ingin mengundang Anda untuk diskusi peluang karir sebagai Senior Fullstack Developer di tim kami secara remote dengan benefit menarik.\n\nApakah Anda ada waktu luang untuk sesi perkenalan singkat minggu ini?",
    timestamp: "2026-07-31T05:20:00.000Z",
    status: "unread"
  },
  {
    id: "msg-2",
    name: "Dr. Klaus Weber",
    email: "klaus.weber@deutsch-akademie.de",
    subject: "Pertanyaan seputar Materi ECL Deutsch B2",
    message: "Sehr geehrter Herr Hajaturrachman,\n\nvielen Dank für das Teilen der strukturierten ECL B2 Vorbereitungsmaterialien auf Ihrer Website. Die Zusammenfassung der Grammatik und Wortschatzlisten ist wirklich hervorragend zusammengestellt.\n\nIch würde gerne fragen, ob Sie auch Tipps untuk ujian lisan (Mündliche Prüfung) yang bisa saya bagikan ke siswa saya?\n\nMit freundlichen Grüßen,\nDr. Klaus Weber",
    timestamp: "2026-07-30T14:45:00.000Z",
    status: "replied"
  },
  {
    id: "msg-3",
    name: "Rian Firmansyah",
    email: "rian.firmansyah@digitalstudio.id",
    subject: "Undangan Kolaborasi Project UI/UX Portfolio",
    message: "Halo Mas Hajat,\n\nDesain portofolio Anda luar biasa futuristik, clean, dan sangat responsif! Kami dari Digital Studio saat ini sedang menggarap platform SaaS analitik terbaru dan tertarik untuk berkolaborasi dengan Mas Hajat sebagai Lead Design Architect.\n\nBoleh minta nomor WhatsApp atau jadwal yang pas untuk Zoom meeting?",
    timestamp: "2026-07-29T09:12:00.000Z",
    status: "read"
  }
];

function readLocalMessages() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
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
  return INITIAL_DEMO_MESSAGES;
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
