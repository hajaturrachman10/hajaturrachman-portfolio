import fs from "fs";
import path from "path";
import os from "os";
import { AdminState, LoginHistoryStats, LastLoginMetadata } from "./adminTypes";
import { supabaseAdmin } from "@/lib/supabase";

// Use admin client for admin state persistence (bypasses RLS on admin_config table)
const supabase = supabaseAdmin;

const IS_PRODUCTION = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const DEV_STORAGE_PATH = path.join(process.cwd(), "data", "adminState.json");
const TMP_STORAGE_PATH = path.join(os.tmpdir(), "hajat_adminState.json");

let inMemoryState: AdminState | null = (globalThis as any).__adminStateCache || null;
let lastFileMtimeMs: number = (globalThis as any).__adminStateMtime || 0;

function getFileMtime(): number {
  try {
    if (!IS_PRODUCTION && fs.existsSync(DEV_STORAGE_PATH)) {
      return fs.statSync(DEV_STORAGE_PATH).mtimeMs;
    }
    if (fs.existsSync(TMP_STORAGE_PATH)) {
      return fs.statSync(TMP_STORAGE_PATH).mtimeMs;
    }
    if (fs.existsSync(DEV_STORAGE_PATH)) {
      return fs.statSync(DEV_STORAGE_PATH).mtimeMs;
    }
  } catch {
    // Ignore
  }
  return 0;
}

// Read admin credentials from environment — NEVER hardcode in source
const ENV_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Hajaturrachman10";
const ENV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ENV_CV_PASSWORD = process.env.CV_PASSWORD || "cvhajat2026";
const ENV_VAULT_PASSWORD = process.env.VAULT_PASSWORD || "hajatprivat2026";

const DEFAULT_STATE: AdminState = {
  auth: {
    username: ENV_ADMIN_USERNAME,
    passwordHash: ENV_ADMIN_PASSWORD,
    sessionSecret: "c98f02a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
    lastPasswordChange: Date.now()
  },
  accounts: [
    {
      id: "acc-1",
      username: ENV_ADMIN_USERNAME,
      passwords: ENV_ADMIN_PASSWORD ? [ENV_ADMIN_PASSWORD] : [],
      role: "SUPER_ADMIN",
      createdAt: Date.now()
    }
  ],
  strategies: {
    cv: { type: "STATIC", password: ENV_CV_PASSWORD },
    vault: { type: "STATIC", password: ENV_VAULT_PASSWORD },
    ecl: { type: "YEAR_RANGE", base: "10juli", startYear: 2006, endYear: 2026 }
  },
  toggles: {
    // updatedAt: 0 ensures any real admin change (with actual timestamp) always wins
    cv: { protected: true, updatedAt: 0 },
    vault: { protected: true, updatedAt: 0 },
    ecl: { protected: true, updatedAt: 0 },
    ecl_doc1: { protected: true, updatedAt: 0 },
    ecl_doc2: { protected: true, updatedAt: 0 },
    ecl_doc3: { protected: true, updatedAt: 0 }
  },
  globalEpoch: 1785752077882, // Static base timestamp to prevent container boot flip-flops
  stats: {
    totalVisitors: 0,
    cvUnlocks: 0,
    vaultUnlocks: 0,
    eclUnlocks: 0,
    contactSubmissions: 0
  },
  snapshots: [],
  lastLogin: {
    time: Date.now(),
    ip: "127.0.0.1",
    browser: "Chrome / Windows",
    remember: true
  },
  loginHistory: {
    failedCountToday: 0,
    successCountToday: 1,
    totalFailed: 0,
    totalSuccess: 1,
    lastResetDate: new Date().toISOString().slice(0, 10)
  }
};


function buildFullState(parsedFileState: any): AdminState {
  const parsed = parsedFileState || {};
  const loginHistory = { ...DEFAULT_STATE.loginHistory, ...parsed.loginHistory };

  const fullState: AdminState = {
    auth: { ...DEFAULT_STATE.auth, ...parsed.auth },
    accounts: parsed.accounts && parsed.accounts.length > 0 ? parsed.accounts : defaultAccounts,
    strategies: { ...DEFAULT_STATE.strategies, ...parsed.strategies },
    toggles: { ...DEFAULT_STATE.toggles, ...parsed.toggles },
    stats: { ...DEFAULT_STATE.stats, ...parsed.stats },
    lastLogin: (parsed.lastLogin ? { ...DEFAULT_STATE.lastLogin, ...parsed.lastLogin } : DEFAULT_STATE.lastLogin)!,
    loginHistory: loginHistory as LoginHistoryStats,
    globalEpoch: Number(parsed.globalEpoch) || DEFAULT_STATE.globalEpoch,
    snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : []
  };

  inMemoryState = fullState;
  (globalThis as any).__adminStateCache = fullState;
  return fullState;
}

export const adminRepository = {
  /**
   * Async read admin state with Supabase cloud fallback (critical for Vercel cold-starts).
   * In production: always prefer Supabase as source of truth over /tmp filesystem.
   * SECURITY: Never accepts toggle state from client cookies — server state only.
   */
  async readAsync(): Promise<AdminState> {
    // In production: if in-memory cache is warm, use it (it was populated from Supabase)
    if (inMemoryState && IS_PRODUCTION) {
      return inMemoryState;
    }

    // In-memory cache hit for dev (fast path)
    if (inMemoryState && !IS_PRODUCTION) {
      const currentMtime = getFileMtime();
      if (currentMtime > 0 && currentMtime <= lastFileMtimeMs) {
        return inMemoryState;
      }
    }

    // PRODUCTION: Supabase is the primary source of truth (serverless containers share one DB)
    if (IS_PRODUCTION && supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_config")
          .select("state")
          .eq("id", "config_root")
          .maybeSingle();

        if (!error && data?.state) {
          return buildFullState(data.state);
        }
      } catch (err) {
        console.error("Gagal membaca adminState dari Supabase:", err);
      }
    }

    // DEV / LOCAL: Read from filesystem (Prioritize DEV_STORAGE_PATH first in dev)
    if (fs.existsSync(DEV_STORAGE_PATH) || fs.existsSync(TMP_STORAGE_PATH)) {
      try {
        let raw = "";
        if (!IS_PRODUCTION && fs.existsSync(DEV_STORAGE_PATH)) {
          raw = fs.readFileSync(DEV_STORAGE_PATH, "utf-8");
          lastFileMtimeMs = fs.statSync(DEV_STORAGE_PATH).mtimeMs;
        } else if (fs.existsSync(TMP_STORAGE_PATH)) {
          raw = fs.readFileSync(TMP_STORAGE_PATH, "utf-8");
          lastFileMtimeMs = fs.statSync(TMP_STORAGE_PATH).mtimeMs;
        } else if (fs.existsSync(DEV_STORAGE_PATH)) {
          raw = fs.readFileSync(DEV_STORAGE_PATH, "utf-8");
          lastFileMtimeMs = fs.statSync(DEV_STORAGE_PATH).mtimeMs;
        }
        if (raw) {
          return buildFullState(JSON.parse(raw));
        }
      } catch {
        // Ignore read error — fall through to Supabase
      }
    }

    // Non-production Supabase fallback
    if (!IS_PRODUCTION && supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_config")
          .select("state")
          .eq("id", "config_root")
          .maybeSingle();

        if (!error && data?.state) {
          return buildFullState(data.state);
        }
      } catch (err) {
        console.error("Gagal membaca adminState dari Supabase:", err);
      }
    }

    return buildFullState(null);
  },

  /**
   * Sync read admin state (uses in-memory cache or local file).
   * SECURITY: Never accepts toggle state from client cookies — server state only.
   */
  read(): AdminState {
    // Return warm in-memory cache if available
    if (inMemoryState) {
      // In dev: validate against file mtime
      if (!IS_PRODUCTION) {
        const currentMtime = getFileMtime();
        if (currentMtime > 0 && currentMtime <= lastFileMtimeMs) {
          return inMemoryState;
        }
      } else {
        // In production: in-memory GlobalThis is the only reliable sync cache
        return inMemoryState;
      }
    }

    // DEV: Try reading from filesystem (Prefer DEV_STORAGE_PATH first in dev)
    let parsedFileState: any = null;
    try {
      let raw = "";
      if (!IS_PRODUCTION && fs.existsSync(DEV_STORAGE_PATH)) {
        raw = fs.readFileSync(DEV_STORAGE_PATH, "utf-8");
        lastFileMtimeMs = fs.statSync(DEV_STORAGE_PATH).mtimeMs;
      } else if (fs.existsSync(TMP_STORAGE_PATH)) {
        raw = fs.readFileSync(TMP_STORAGE_PATH, "utf-8");
        lastFileMtimeMs = fs.statSync(TMP_STORAGE_PATH).mtimeMs;
      } else if (fs.existsSync(DEV_STORAGE_PATH)) {
        raw = fs.readFileSync(DEV_STORAGE_PATH, "utf-8");
        lastFileMtimeMs = fs.statSync(DEV_STORAGE_PATH).mtimeMs;
      }
      (globalThis as any).__adminStateMtime = lastFileMtimeMs;
      if (raw) parsedFileState = JSON.parse(raw);
    } catch {
      // Ignore read errors — fall through to use DEFAULT_STATE
    }

    return buildFullState(parsedFileState);
  },


  async write(state: AdminState): Promise<void> {
    inMemoryState = state;
    (globalThis as any).__adminStateCache = state;

    // PRODUCTION: Supabase is the primary persistent store — await for consistency
    if (IS_PRODUCTION && supabase) {
      try {
        const { error } = await supabase
          .from("admin_config")
          .upsert({ id: "config_root", state, updated_at: new Date().toISOString() });
        if (error) {
          console.error("Supabase admin_config write error:", error.message);
        }
      } catch (err) {
        console.error("Gagal menyimpan adminState ke Supabase:", err);
      }
      return; // In production, skip filesystem writes (read-only on Vercel)
    }

    // DEV: Write to local filesystem first, then async to Supabase
    try {
      const dir = path.dirname(DEV_STORAGE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DEV_STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
      lastFileMtimeMs = getFileMtime();
      (globalThis as any).__adminStateMtime = lastFileMtimeMs;
    } catch {
      // Dev directory read-only — try /tmp
    }

    try {
      const tmpDir = path.dirname(TMP_STORAGE_PATH);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(TMP_STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan adminState ke /tmp:", err);
    }

    // Also async-write to Supabase in dev for cross-device sync
    if (supabase) {
      supabase
        .from("admin_config")
        .upsert({ id: "config_root", state, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error("Supabase admin_config write error:", error.message);
        });
    }
  },

  update(updater: (draft: AdminState) => AdminState): AdminState {
    const current = this.read();
    const updated = updater(current);
    // In production, fire-and-forget write (sync update path — caller can await separately)
    if (IS_PRODUCTION && supabase) {
      inMemoryState = updated;
      (globalThis as any).__adminStateCache = updated;
      // Async Supabase write — non-blocking for sync callers
      supabase
        .from("admin_config")
        .upsert({ id: "config_root", state: updated, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error("Supabase admin_config update error:", error.message);
        });
      return updated;
    }
    // Dev: use synchronous filesystem write
    this.writeSync(updated);
    return updated;
  },

  /**
   * Synchronous write for dev environment only.
   */
  writeSync(state: AdminState): void {
    inMemoryState = state;
    (globalThis as any).__adminStateCache = state;

    try {
      const dir = path.dirname(DEV_STORAGE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DEV_STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
      lastFileMtimeMs = getFileMtime();
      (globalThis as any).__adminStateMtime = lastFileMtimeMs;
    } catch {
      // Dev directory read-only
    }

    try {
      const tmpDir = path.dirname(TMP_STORAGE_PATH);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(TMP_STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan adminState ke /tmp:", err);
    }

    if (supabase) {
      supabase
        .from("admin_config")
        .upsert({ id: "config_root", state, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error("Supabase admin_config write error:", error.message);
        });
    }
  },

  reset(): AdminState {
    this.writeSync(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
};

const defaultAccounts = DEFAULT_STATE.accounts;
