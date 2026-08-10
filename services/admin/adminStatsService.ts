import { adminRepository } from "./adminRepository";
import { AdminStats, ServiceResult } from "./adminTypes";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");

async function getLiveContactSubmissionsCountAsync(): Promise<number> {
  if (supabaseAdmin) {
    try {
      const { count, error } = await supabaseAdmin
        .from("contacts")
        .select("id", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        return count;
      }
    } catch (err) {
      console.error("Gagal menghitung jumlah pesan dari Supabase:", err);
    }
  }

  // Local dev fallback
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    }
  } catch { /* ignore */ }
  return 0;
}

function getLiveContactSubmissionsCountSync(): number {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
    }
  } catch { /* ignore */ }
  return 0;
}

export const adminStatsService = {
  async getStatisticsAsync(): Promise<ServiceResult<AdminStats>> {
    const state = await adminRepository.readAsync();
    const liveMessagesCount = await getLiveContactSubmissionsCountAsync();

    const syncedStats: AdminStats = {
      ...state.stats,
      contactSubmissions: liveMessagesCount
    };

    if (state.stats.contactSubmissions !== liveMessagesCount) {
      adminRepository.update((draft) => {
        draft.stats.contactSubmissions = liveMessagesCount;
        return draft;
      });
    }

    return {
      success: true,
      data: syncedStats
    };
  },

  getStatistics(): ServiceResult<AdminStats> {
    const state = adminRepository.read();
    const liveMessagesCount = getLiveContactSubmissionsCountSync();

    const syncedStats: AdminStats = {
      ...state.stats,
      contactSubmissions: liveMessagesCount
    };

    return {
      success: true,
      data: syncedStats
    };
  },

  getSummary(): ServiceResult<AdminStats> {
    return this.getStatistics();
  },

  async incrementAsync(metric: keyof AdminStats): Promise<ServiceResult<AdminStats>> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] += 1;
      }
      return draft;
    });
    return this.getStatisticsAsync();
  },

  increment(metric: keyof AdminStats): ServiceResult<AdminStats> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] += 1;
      }
      return draft;
    });

    return this.getStatistics();
  },

  async decrementAsync(metric: keyof AdminStats): Promise<ServiceResult<AdminStats>> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number" && draft.stats[metric] > 0) {
        draft.stats[metric] -= 1;
      }
      return draft;
    });
    return this.getStatisticsAsync();
  },

  decrement(metric: keyof AdminStats): ServiceResult<AdminStats> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number" && draft.stats[metric] > 0) {
        draft.stats[metric] -= 1;
      }
      return draft;
    });

    return this.getStatistics();
  },

  async resetAsync(metric: keyof AdminStats): Promise<ServiceResult<AdminStats>> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] = 0;
      }
      return draft;
    });
    return this.getStatisticsAsync();
  },

  reset(metric: keyof AdminStats): ServiceResult<AdminStats> {
    adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] = 0;
      }
      return draft;
    });

    return this.getStatistics();
  },


  async resetAllAsync(): Promise<ServiceResult<AdminStats>> {
    const liveMessagesCount = await getLiveContactSubmissionsCountAsync();
    const updatedState = adminRepository.update((draft) => {
      draft.stats = {
        totalVisitors: 0,
        cvUnlocks: 0,
        vaultUnlocks: 0,
        eclUnlocks: 0,
        contactSubmissions: liveMessagesCount
      };
      return draft;
    });

    return {
      success: true,
      data: updatedState.stats
    };
  },

  resetAll(): ServiceResult<AdminStats> {
    const liveMessagesCount = getLiveContactSubmissionsCountSync();
    const updatedState = adminRepository.update((draft) => {
      draft.stats = {
        totalVisitors: 0,
        cvUnlocks: 0,
        vaultUnlocks: 0,
        eclUnlocks: 0,
        contactSubmissions: liveMessagesCount
      };
      return draft;
    });

    return {
      success: true,
      data: updatedState.stats
    };
  }
};
