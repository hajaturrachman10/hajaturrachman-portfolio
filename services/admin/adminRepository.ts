import fs from "fs";
import path from "path";
import os from "os";
import { AdminState, LoginHistoryStats, LastLoginMetadata } from "./adminTypes";

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

const DEFAULT_STATE: AdminState = {
  auth: {
    username: "Hajaturrachman10",
    passwordHash: "Xyzordie67@",
    sessionSecret: "c98f02a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
    lastPasswordChange: Date.now()
  },
  accounts: [
    {
      id: "acc-1",
      username: "Hajaturrachman10",
      passwords: ["Xyzordie67@"],
      role: "SUPER_ADMIN",
      createdAt: Date.now()
    }
  ],
  strategies: {
    cv: { type: "STATIC", password: "cvhajat2026" },
    vault: { type: "STATIC", password: "hajatprivat2026" },
    ecl: { type: "YEAR_RANGE", base: "10juli", startYear: 2006, endYear: 2026 }
  },
  toggles: {
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

export const adminRepository = {
  read(): AdminState {
    const currentMtime = getFileMtime();
    if (inMemoryState && currentMtime > 0 && currentMtime <= lastFileMtimeMs) {
      return inMemoryState;
    }

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

      if (!raw) {
        inMemoryState = DEFAULT_STATE;
        (globalThis as any).__adminStateCache = DEFAULT_STATE;
        this.write(DEFAULT_STATE);
        return DEFAULT_STATE;
      }

      const parsed = JSON.parse(raw);
      const loginHistory = {
        ...DEFAULT_STATE.loginHistory,
        ...parsed.loginHistory
      };
      
      const fullState: AdminState = {
        auth: { ...DEFAULT_STATE.auth, ...parsed.auth },
        accounts: parsed.accounts && parsed.accounts.length > 0 ? parsed.accounts : defaultAccounts,
        strategies: { ...DEFAULT_STATE.strategies, ...parsed.strategies },
        toggles: { ...DEFAULT_STATE.toggles, ...parsed.toggles },
        stats: { ...DEFAULT_STATE.stats, ...parsed.stats },
        lastLogin: (parsed.lastLogin ? { ...DEFAULT_STATE.lastLogin, ...parsed.lastLogin } : DEFAULT_STATE.lastLogin)!,
        loginHistory: loginHistory as LoginHistoryStats,
        globalEpoch: Number(parsed.globalEpoch) || DEFAULT_STATE.globalEpoch
      };

      try {
        const { cookies } = require("next/headers");
        const togglesCookie = cookies().get("hajat_toggles_state")?.value;
        if (togglesCookie) {
          const cookieData = JSON.parse(decodeURIComponent(togglesCookie));
          
          if (cookieData && typeof cookieData === "object") {
            if (cookieData.toggles && typeof cookieData.toggles === "object") {
              // New nested format: { toggles: { cv: { protected, updatedAt } }, globalEpoch: 123 }
              Object.keys(cookieData.toggles).forEach((key) => {
                const k = key as keyof typeof fullState.toggles;
                if (fullState.toggles[k] && cookieData.toggles[k]) {
                  const cookieTime = Number(cookieData.toggles[k].updatedAt) || 0;
                  const dbTime = Number(fullState.toggles[k].updatedAt) || 0;
                  if (cookieTime > dbTime) {
                    fullState.toggles[k] = {
                      protected: Boolean(cookieData.toggles[k].protected),
                      updatedAt: cookieTime
                    };
                  }
                }
              });

              const cookieEpoch = Number(cookieData.globalEpoch) || 0;
              if (cookieEpoch > fullState.globalEpoch) {
                fullState.globalEpoch = cookieEpoch;
              }
            } else {
              // Legacy flat format: { cv: true, ... }
              Object.keys(cookieData).forEach((key) => {
                const k = key as keyof typeof fullState.toggles;
                if (fullState.toggles[k]) {
                  fullState.toggles[k] = {
                    ...fullState.toggles[k],
                    protected: Boolean(cookieData[key])
                  };
                }
              });
            }
          }
        }
      } catch {
        // Ignore if outside request context
      }

      inMemoryState = fullState;
      (globalThis as any).__adminStateCache = fullState;
      return fullState;
    } catch {
      inMemoryState = DEFAULT_STATE;
      (globalThis as any).__adminStateCache = DEFAULT_STATE;
      return DEFAULT_STATE;
    }
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
