import { adminRepository } from "./adminRepository";
import { AdminStats, ServiceResult } from "./adminTypes";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");

function getLiveContactSubmissionsCount(): number {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    }
  } catch (err) {
    console.error("Gagal menghitung jumlah pesan kontak live:", err);
  }
  return 0;
}

export const adminStatsService = {
  getStatistics(): ServiceResult<AdminStats> {
    const state = adminRepository.read();
    const liveMessagesCount = getLiveContactSubmissionsCount();

    // Ensure contactSubmissions is dynamically synchronized 1:1 with data/messages.json
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

  getSummary(): ServiceResult<AdminStats> {
    return this.getStatistics();
  },

  increment(metric: keyof AdminStats): ServiceResult<AdminStats> {
    const updatedState = adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] += 1;
      }
      return draft;
    });

    return this.getStatistics();
  },

  decrement(metric: keyof AdminStats): ServiceResult<AdminStats> {
    const updatedState = adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number" && draft.stats[metric] > 0) {
        draft.stats[metric] -= 1;
      }
      return draft;
    });

    return this.getStatistics();
  },

  reset(metric: keyof AdminStats): ServiceResult<AdminStats> {
    const updatedState = adminRepository.update((draft) => {
      if (typeof draft.stats[metric] === "number") {
        draft.stats[metric] = 0;
      }
      return draft;
    });

    return this.getStatistics();
  },

  resetAll(): ServiceResult<AdminStats> {
    const liveMessagesCount = getLiveContactSubmissionsCount();
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
