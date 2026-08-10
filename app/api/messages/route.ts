import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

// Use admin client (Service Role Key) for server-side message operations
const supabase = supabaseAdmin;


// Detect Vercel serverless production (data/ dir is read-only there)
const IS_PRODUCTION = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const DATA_DIR = path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const DELETED_FILE = path.join(DATA_DIR, "deleted_messages.json");
const STATUSES_FILE = path.join(DATA_DIR, "message_statuses.json");

// ─────────────────────────────────────────────────────────────────────────────
// Fingerprint: deterministic signature per message (email::message[0..150])
// Used to filter deleted messages even when IDs change (e.g. Supabase integer id)
// ─────────────────────────────────────────────────────────────────────────────
function getFingerprint(m: { email?: string; message?: string }): string {
  const e = String(m?.email || "").toLowerCase().trim();
  const msg = String(m?.message || "").toLowerCase().trim().substring(0, 150);
  return `${e}::${msg}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deleted signatures tracker — local dev only (production uses client localStorage)
// ─────────────────────────────────────────────────────────────────────────────
function readDeletedSigs(): Set<string> {
  if (IS_PRODUCTION) return new Set();
  try {
    if (fs.existsSync(DELETED_FILE)) {
      const raw = fs.readFileSync(DELETED_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch { /* ignore */ }
  return new Set();
}

function addDeletedSig(id: string, email?: string, message?: string) {
  if (IS_PRODUCTION) return; // Production: rely on Supabase DELETE + client localStorage
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const current = Array.from(readDeletedSigs());
    if (id && !current.includes(id)) current.push(id);
    if (email || message) {
      const fp = getFingerprint({ email, message });
      if (fp && !current.includes(fp)) current.push(fp);
    }
    fs.writeFileSync(DELETED_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing deleted sigs:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status overrides tracker — local dev only
// ─────────────────────────────────────────────────────────────────────────────
function readStatusOverrides(): Record<string, string> {
  if (IS_PRODUCTION) return {};
  try {
    if (fs.existsSync(STATUSES_FILE)) {
      const raw = fs.readFileSync(STATUSES_FILE, "utf-8");
      return JSON.parse(raw) || {};
    }
  } catch { /* ignore */ }
  return {};
}

function saveStatusOverride(key: string, status: string) {
  if (IS_PRODUCTION) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const current = readStatusOverrides();
    current[key] = status;
    fs.writeFileSync(STATUSES_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing status overrides:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local / Fallback file helpers (supports /tmp on Vercel production and data/ in dev)
// ─────────────────────────────────────────────────────────────────────────────
function readLocalMessages(): any[] {

  const targetFile = IS_PRODUCTION ? "/tmp/messages.json" : MESSAGES_FILE;
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, "utf-8");
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
    console.error("Error reading fallback messages file:", err);
  }
  return [];
}

function writeLocalMessages(messages: any[]) {
  const targetDir = IS_PRODUCTION ? "/tmp" : DATA_DIR;
  const targetFile = IS_PRODUCTION ? "/tmp/messages.json" : MESSAGES_FILE;
  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing fallback messages file:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Map a Supabase row → message object
// ─────────────────────────────────────────────────────────────────────────────
function mapSupabaseRow(m: any): any {
  return {
    id: String(m.id), // Use Supabase's own id (int/UUID) stringified as canonical id
    name: m.name || "Anonim",
    email: m.email || "-",
    subject: m.subject || `Pesan Kontak dari ${m.name || "Pengunjung"}`,
    message: m.message || "",
    timestamp: m.created_at || m.timestamp || new Date().toISOString(),
    status: m.status || "unread"
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — fetch all messages
// Merges Supabase primary database messages + serverless /tmp or local file messages
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const deletedSigs = readDeletedSigs();
  const statusOverrides = readStatusOverrides();

  const isMsgDeleted = (m: any) => {
    if (!m) return true;
    if (m.id && deletedSigs.has(m.id)) return true;
    const fp = getFingerprint(m);
    if (fp && deletedSigs.has(fp)) return true;
    return false;
  };

  let remoteMsgs: any[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        remoteMsgs = data.map(mapSupabaseRow);
      }
    } catch (err) {
      console.error("Error fetching messages from Supabase:", err);
    }
  }

  // Build deduplicated map from Supabase (primary source)
  const map = new Map<string, any>();
  for (const m of remoteMsgs) {
    if (m && m.id && !isMsgDeleted(m)) {
      const fp = getFingerprint(m);
      const statusOverride = statusOverrides[m.id] || statusOverrides[fp];
      map.set(m.id, statusOverride ? { ...m, status: statusOverride } : m);
    }
  }

  // Merge fallback file messages (from /tmp in production or data/ in dev)
  const localMsgs = readLocalMessages();
  for (const m of localMsgs) {
    if (m && m.id && !isMsgDeleted(m) && !map.has(m.id)) {
      const fp = getFingerprint(m);
      const statusOverride = statusOverrides[m.id] || statusOverrides[fp];
      map.set(m.id, statusOverride ? { ...m, status: statusOverride } : m);
    }
  }

  const messages = Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({ success: true, messages });
}


// ─────────────────────────────────────────────────────────────────────────────
// POST — save new message (admin UI only; public form uses /api/contact)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newMsg = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
        const { data: inserted, error } = await supabase
          .from("contacts")
          .insert([newMsg])
          .select("id")
          .single();
        if (!error && inserted?.id) {
          newMsg.id = String(inserted.id); // Use Supabase-assigned id
        } else if (error) {
          await supabase.from("contacts").insert([{
            name: body.name,
            email: body.email,
            subject: newMsg.subject,
            message: body.message,
            created_at: newMsg.created_at,
            status: newMsg.status
          }]);

        }
      } catch (err) {
        console.error("Gagal menyimpan ke Supabase:", err);
      }
    }

    if (!IS_PRODUCTION) {
      const current = readLocalMessages();
      const updated = [newMsg, ...current.filter((m: any) => m.id !== newMsg.id)];
      writeLocalMessages(updated);
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal menyimpan pesan" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — update message status (read/replied)
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (id && status) {
      saveStatusOverride(id, status);
    }

    if (supabase && id) {
      try {
        await supabase.from("contacts").update({ status }).eq("id", id);
      } catch (err) {
        console.error("Gagal memperbarui status di Supabase:", err);
      }
    }

    if (!IS_PRODUCTION) {
      const current = readLocalMessages();
      const updated = current.map((m: any) => {
        if (m.id === id) {
          saveStatusOverride(getFingerprint(m), status);
          return { ...m, status };
        }
        return m;
      });
      writeLocalMessages(updated);
      return NextResponse.json({ success: true, messages: updated });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal memperbarui status pesan" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — remove a message permanently
// Uses BOTH id-based AND fingerprint-based Supabase deletion for maximum reliability
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID pesan wajib diisi" }, { status: 400 });
    }

    // Find message info before deleting (for fingerprint deletion)
    let targetEmail: string | undefined;
    let targetMessage: string | undefined;

    if (supabase) {
      try {
        // 1. Lookup the row first to get email+message for fingerprint delete
        const { data: found } = await supabase
          .from("contacts")
          .select("id, email, message")
          .eq("id", id)
          .maybeSingle();

        if (found) {
          targetEmail = found.email;
          targetMessage = found.message;
        }

        // 2. Delete by Supabase id (PostgREST coerces string "42" → integer 42)
        await supabase.from("contacts").delete().eq("id", id);

        // 3. Belt-and-suspenders: also delete by email+message fingerprint
        // Catches duplicates and cases where id-based delete didn't match
        if (targetEmail && targetMessage) {
          await supabase.from("contacts").delete()
            .eq("email", targetEmail)
            .eq("message", targetMessage);
        }
      } catch (err) {
        console.error("Gagal menghapus pesan dari Supabase:", err);
      }
    }

    // Record deletion signatures (local dev: persist to file; production: no-op)
    addDeletedSig(id, targetEmail, targetMessage);

    if (!IS_PRODUCTION) {
      // Also delete from local file
      const current = readLocalMessages();
      const updated = current.filter((m: any) => {
        if (m.id === id) return false;
        if (targetEmail && targetMessage) {
          if (m.email === targetEmail && m.message === targetMessage) return false;
        }
        return true;
      });
      writeLocalMessages(updated);
      return NextResponse.json({ success: true, messages: updated });
    }

    return NextResponse.json({ success: true, messages: [] });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
