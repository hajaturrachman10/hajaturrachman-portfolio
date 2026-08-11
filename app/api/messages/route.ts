import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
// Deleted signatures tracker
// PRODUCTION: Stored in Supabase `admin_config` table under key "deleted_message_sigs"
// DEV: Stored in local data/ directory
// This ensures zombie messages don't reappear after serverless container restarts
// ─────────────────────────────────────────────────────────────────────────────
async function readDeletedSigsAsync(): Promise<Set<string>> {
  // In production, read from Supabase (persistent across container restarts)
  if (IS_PRODUCTION && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_config")
        .select("state")
        .eq("id", "deleted_message_sigs")
        .maybeSingle();
      if (!error && data?.state && Array.isArray(data.state)) {
        return new Set(data.state as string[]);
      }
    } catch {
      // Fallback to empty set
    }
    return new Set();
  }

  // Dev: read from local file
  const targetFile = DELETED_FILE;
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch { /* ignore */ }
  return new Set();
}

function readDeletedSigsSync(): Set<string> {
  const targetFile = IS_PRODUCTION ? "/tmp/deleted_messages.json" : DELETED_FILE;
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch { /* ignore */ }
  return new Set();
}

async function addDeletedSigAsync(id: string, email?: string, message?: string) {
  const current = await readDeletedSigsAsync();
  if (id && !current.has(String(id))) current.add(String(id));
  if (email || message) {
    const fp = getFingerprint({ email, message });
    if (fp) current.add(fp);
  }
  const sigs = Array.from(current);

  if (IS_PRODUCTION && supabase) {
    try {
      await supabase
        .from("admin_config")
        .upsert({ id: "deleted_message_sigs", state: sigs, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error("Error saving deleted sigs to Supabase:", err);
    }
    // Also cache in /tmp as local fallback
    try {
      fs.writeFileSync("/tmp/deleted_messages.json", JSON.stringify(sigs, null, 2), "utf-8");
    } catch { /* ignore */ }
    return;
  }

  // Dev: save to local file
  const targetDir = DATA_DIR;
  const targetFile = DELETED_FILE;
  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(sigs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing deleted sigs:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status overrides tracker
// PRODUCTION: Stored in Supabase `admin_config` table under key "message_status_overrides"
// DEV: Stored in local data/ directory
// ─────────────────────────────────────────────────────────────────────────────
async function readStatusOverridesAsync(): Promise<Record<string, string>> {
  if (IS_PRODUCTION && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_config")
        .select("state")
        .eq("id", "message_status_overrides")
        .maybeSingle();
      if (!error && data?.state && typeof data.state === "object") {
        return data.state as Record<string, string>;
      }
    } catch { /* ignore */ }
    return {};
  }

  const targetFile = STATUSES_FILE;
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      return JSON.parse(raw) || {};
    }
  } catch { /* ignore */ }
  return {};
}

async function saveStatusOverrideAsync(key: string, status: string) {
  const current = await readStatusOverridesAsync();
  current[key] = status;

  if (IS_PRODUCTION && supabase) {
    try {
      await supabase
        .from("admin_config")
        .upsert({ id: "message_status_overrides", state: current, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error("Error saving status overrides to Supabase:", err);
    }
    return;
  }

  const targetDir = DATA_DIR;
  const targetFile = STATUSES_FILE;
  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(current, null, 2), "utf-8");
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
          id: String(m.id || Date.now()),
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
    id: String(m.id), // Use Supabase's own id stringified as canonical id
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
// Deduplicates by both ID and Fingerprint to prevent zombie / duplicate messages
// Deleted sigs are now stored in Supabase (not /tmp) to survive container restarts
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  // Read deleted sigs and status overrides from persistent store (Supabase in prod)
  const deletedSigs = await readDeletedSigsAsync();
  const statusOverrides = await readStatusOverridesAsync();

  const isMsgDeleted = (m: any) => {
    if (!m) return true;
    if (m.id && deletedSigs.has(String(m.id))) return true;
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
  const seenFingerprints = new Set<string>();

  for (const m of remoteMsgs) {
    if (m && m.id && !isMsgDeleted(m)) {
      const fp = getFingerprint(m);
      if (!seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        const statusOverride = statusOverrides[m.id] || statusOverrides[fp];
        map.set(m.id, statusOverride ? { ...m, status: statusOverride } : m);
      }
    }
  }

  // Merge fallback file messages (only if not already present in Supabase by ID or Fingerprint)
  const localMsgs = readLocalMessages();
  for (const m of localMsgs) {
    if (m && m.id && !isMsgDeleted(m)) {
      const fp = getFingerprint(m);
      if (!map.has(String(m.id)) && !seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        const statusOverride = statusOverrides[String(m.id)] || statusOverrides[fp];
        map.set(String(m.id), statusOverride ? { ...m, status: statusOverride } : m);
      }
    }
  }

  const messages = Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json(
    { success: true, messages },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache"
      }
    }
  );
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

    const current = readLocalMessages();
    const updated = [newMsg, ...current.filter((m: any) => String(m.id) !== newMsg.id && getFingerprint(m) !== getFingerprint(newMsg))];
    writeLocalMessages(updated);

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

    // Save status override to persistent store
    if (id && status) {
      await saveStatusOverrideAsync(String(id), status);
    }

    if (supabase && id) {
      try {
        await supabase.from("contacts").update({ status }).eq("id", id);
      } catch (err) {
        console.error("Gagal memperbarui status di Supabase:", err);
      }
    }

    const current = readLocalMessages();
    const updated = current.map((m: any) => {
      if (String(m.id) === String(id)) {
        // Also save fingerprint-based override
        saveStatusOverrideAsync(getFingerprint(m), status);
        return { ...m, status };
      }
      return m;
    });
    writeLocalMessages(updated);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal memperbarui status pesan" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — remove a message permanently
// Deleted signatures are stored in Supabase (not /tmp) to survive serverless restarts
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

    // Check local messages first for fingerprint
    const currentLocal = readLocalMessages();
    const foundLocal = currentLocal.find((m: any) => String(m.id) === String(id));
    if (foundLocal) {
      targetEmail = foundLocal.email;
      targetMessage = foundLocal.message;
    }

    if (supabase) {
      try {
        // 1. Lookup the row first to get email+message for fingerprint delete if not found locally
        if (!targetEmail || !targetMessage) {
          const { data: found } = await supabase
            .from("contacts")
            .select("id, email, message")
            .eq("id", id)
            .maybeSingle();

          if (found) {
            targetEmail = found.email;
            targetMessage = found.message;
          }
        }

        // 2. Delete by Supabase id
        await supabase.from("contacts").delete().eq("id", id);

        // 3. Delete by email+message fingerprint (catches duplicates and string/int id mismatches)
        if (targetEmail && targetMessage) {
          await supabase.from("contacts").delete()
            .eq("email", targetEmail)
            .eq("message", targetMessage);
        }
      } catch (err) {
        console.error("Gagal menghapus pesan dari Supabase:", err);
      }
    }

    // Record deletion signatures in PERSISTENT store (Supabase in prod, file in dev)
    // This prevents zombie messages from reappearing after container restarts
    await addDeletedSigAsync(id, targetEmail, targetMessage);

    // Erase message from local fallback messages file permanently
    const targetFp = targetEmail && targetMessage ? getFingerprint({ email: targetEmail, message: targetMessage }) : null;
    const updatedLocal = currentLocal.filter((m: any) => {
      if (String(m.id) === String(id)) return false;
      if (targetFp && getFingerprint(m) === targetFp) return false;
      return true;
    });
    writeLocalMessages(updatedLocal);

    return NextResponse.json({ success: true, messages: updatedLocal });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
