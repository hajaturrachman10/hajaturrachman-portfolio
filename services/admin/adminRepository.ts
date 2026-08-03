import fs from "fs";
import path from "path";
import { AdminState, LoginHistoryStats, LastLoginMetadata } from "./adminTypes";

const STORAGE_PATH = path.join(process.cwd(), "data", "adminState.json");

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
    cv: { protected: true, updatedAt: Date.now() },
    vault: { protected: true, updatedAt: Date.now() },
    ecl: { protected: true, updatedAt: Date.now() },
    ecl_doc1: { protected: true, updatedAt: Date.now() },
    ecl_doc2: { protected: true, updatedAt: Date.now() },
    ecl_doc3: { protected: true, updatedAt: Date.now() }
  },
  globalEpoch: Date.now(),
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
    try {
      if (!fs.existsSync(STORAGE_PATH)) {
        this.write(DEFAULT_STATE);
        return DEFAULT_STATE;
      }
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<AdminState>;

      const todayStr = new Date().toISOString().slice(0, 10);
      const loginHistory = {
        ...DEFAULT_STATE.loginHistory,
        ...(parsed.loginHistory || {})
      };

      // Reset daily counts if new day
      if (loginHistory.lastResetDate !== todayStr) {
        loginHistory.failedCountToday = 0;
        loginHistory.successCountToday = 0;
        loginHistory.lastResetDate = todayStr;
      }

      const defaultAccounts = [
        {
          id: "acc-1",
          username: parsed.auth?.username || "Hajaturrachman10",
          passwords: [parsed.auth?.passwordHash || "Xyzordie67@"],
          role: "SUPER_ADMIN" as const,
          createdAt: Date.now()
        }
      ];

      return {
        ...DEFAULT_STATE,
        ...parsed,
        auth: { ...DEFAULT_STATE.auth, ...parsed.auth },
        accounts: parsed.accounts && parsed.accounts.length > 0 ? parsed.accounts : defaultAccounts,
        strategies: { ...DEFAULT_STATE.strategies, ...parsed.strategies },
        toggles: { ...DEFAULT_STATE.toggles, ...parsed.toggles },
        stats: { ...DEFAULT_STATE.stats, ...parsed.stats },
        lastLogin: (parsed.lastLogin ? { ...DEFAULT_STATE.lastLogin, ...parsed.lastLogin } : DEFAULT_STATE.lastLogin)!,
        loginHistory: loginHistory as LoginHistoryStats
      };
    } catch {
      return DEFAULT_STATE;
    }
  },

  write(state: AdminState): void {
    try {
      const dir = path.dirname(STORAGE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan adminState.json:", err);
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
