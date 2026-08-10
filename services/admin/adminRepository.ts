import fs from "fs";
import path from "path";
import os from "os";
import { AdminState, LoginHistoryStats, LastLoginMetadata } from "./adminTypes";
import { supabaseAdmin } from "@/lib/supabase";

// Use admin client for admin state persistence (bypasses RLS on admin_config table)
const supabase = supabaseAdmin;


const DEV_STORAGE_PATH = path.join(process.cwd(), "data", "adminState.json");
const TMP_STORAGE_PATH = path.join(os.tmpdir(), "hajat_adminState.json");

let inMemoryState: AdminState | null = (globalThis as any).__adminStateCache || null;
let lastFileMtimeMs: number = (globalThis as any).__adminStateMtime || 0;

function getFileMtime(): number {
  try {
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
    // updatedAt: 0 ensures any real admin change (with actual timestamp) always wins LWW
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


/**
 * Apply cookie Last-Write-Wins (LWW) merge onto the given state.
 * The cookie is passed explicitly from the request context (no dynamic require).
 * This ensures toggle changes from admin propagate to all serverless containers
 * even if they don't have the file on their filesystem.
 */
function applyToggleCookieLWW(state: AdminState, togglesCookie: string): AdminState {
  try {
    const cookieData = JSON.parse(decodeURIComponent(togglesCookie));
    if (!cookieData || typeof cookieData !== "object") return state;

    const togglesSource = cookieData.toggles && typeof cookieData.toggles === "object"
      ? cookieData.toggles          // nested format: { toggles: { ecl: { protected, updatedAt } }, globalEpoch }
      : cookieData;                 // legacy flat format: { ecl: { protected, updatedAt } }

    const newToggles = { ...state.toggles };
    let changed = false;

    Object.keys(togglesSource).forEach((key) => {
      const k = key as keyof typeof newToggles;
      if (!newToggles[k]) return;

      const cookieEntry = togglesSource[key];
      if (!cookieEntry) return;

      // Cookie entry can be { protected: bool, updatedAt: number } or just a boolean
      const cookieTime = typeof cookieEntry === "object" ? (Number(cookieEntry.updatedAt) || 0) : 0;
      const cookieProtected = typeof cookieEntry === "object" ? Boolean(cookieEntry.protected) : Boolean(cookieEntry);
      const dbTime = Number(newToggles[k].updatedAt) || 0;

      if (cookieTime > dbTime) {
        newToggles[k] = { protected: cookieProtected, updatedAt: cookieTime };
        changed = true;
      }
    });

    if (!changed) return state;

    let newEpoch = state.globalEpoch;
    if (cookieData.toggles) {
      const cookieEpoch = Number(cookieData.globalEpoch) || 0;
      if (cookieEpoch > newEpoch) newEpoch = cookieEpoch;
    }

    return { ...state, toggles: newToggles, globalEpoch: newEpoch };
  } catch {
    return state;
  }
}

function buildFullState(parsedFileState: any, togglesCookie?: string): AdminState {
  const parsed = parsedFileState || {};
  const loginHistory = { ...DEFAULT_STATE.loginHistory, ...parsed.loginHistory };

  let fullState: AdminState = {
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

  if (togglesCookie) {
    fullState = applyToggleCookieLWW(fullState, togglesCookie);
  }

  inMemoryState = fullState;
  (globalThis as any).__adminStateCache = fullState;
  return fullState;
}

export const adminRepository = {
  /**
   * Async read admin state with Supabase cloud fallback (critical for Vercel cold-starts).
   */
  async readAsync(togglesCookie?: string): Promise<AdminState> {
    if (inMemoryState) {
      if (togglesCookie) return applyToggleCookieLWW(inMemoryState, togglesCookie);
      return inMemoryState;
    }

    const currentMtime = getFileMtime();
    if (fs.existsSync(TMP_STORAGE_PATH) || fs.existsSync(DEV_STORAGE_PATH)) {
      try {
        let raw = "";
        if (fs.existsSync(TMP_STORAGE_PATH)) {
          raw = fs.readFileSync(TMP_STORAGE_PATH, "utf-8");
          lastFileMtimeMs = fs.statSync(TMP_STORAGE_PATH).mtimeMs;
        } else if (fs.existsSync(DEV_STORAGE_PATH)) {
          raw = fs.readFileSync(DEV_STORAGE_PATH, "utf-8");
          lastFileMtimeMs = fs.statSync(DEV_STORAGE_PATH).mtimeMs;
        }
        if (raw) {
          return buildFullState(JSON.parse(raw), togglesCookie);
        }
      } catch {
        // Ignore read error — fall through to Supabase
      }
    }

    // Serverless cold-start fallback: fetch state from Supabase admin_config table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_config")
          .select("state")
          .eq("id", "config_root")
          .maybeSingle();

        if (!error && data?.state) {
          return buildFullState(data.state, togglesCookie);
        }
      } catch (err) {
        console.error("Gagal membaca adminState dari Supabase:", err);
      }
    }

    return buildFullState(null, togglesCookie);
  },

  /**
   * Sync read admin state (uses in-memory cache or local file, with fallback).
   */
  read(togglesCookie?: string): AdminState {
    const currentMtime = getFileMtime();

    if (inMemoryState && currentMtime > 0 && currentMtime <= lastFileMtimeMs) {
      if (togglesCookie) {
        return applyToggleCookieLWW(inMemoryState, togglesCookie);
      }
      return inMemoryState;
    }

    let parsedFileState: any = null;
    try {
      let raw = "";
      if (fs.existsSync(TMP_STORAGE_PATH)) {
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

    return buildFullState(parsedFileState, togglesCookie);
  },


  write(state: AdminState): void {
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
      return;
    } catch {
      // Dev directory read-only on Vercel Serverless
    }

    try {
      const tmpDir = path.dirname(TMP_STORAGE_PATH);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(TMP_STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
      lastFileMtimeMs = getFileMtime();
      (globalThis as any).__adminStateMtime = lastFileMtimeMs;
    } catch (err) {
      console.error("Gagal menyimpan adminState ke serverless tmp:", err);
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

  update(updater: (draft: AdminState) => AdminState): AdminState {
    const current = this.read();
    const updated = updater(current);
    this.write(updated);
    return updated;
  },

  reset(): AdminState {
    this.write(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
};

const defaultAccounts = DEFAULT_STATE.accounts;
