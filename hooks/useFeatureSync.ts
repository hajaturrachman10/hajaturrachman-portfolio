"use client";

import { useEffect } from "react";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";

type FeatureKey = "cv" | "vault" | "ecl" | "ecl_doc1" | "ecl_doc2" | "ecl_doc3";

export function useFeatureSync(
  featureKey: FeatureKey,
  onUnlockedStateChange: (unlocked: boolean) => void,
  pollIntervalMs: number = 4000
) {
  useEffect(() => {
    // 1. Cross-tab event listener (same-device, same-browser)
    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (msg.event === "TOGGLE_CHANGED") {
        const togglesMap = msg.data?.togglesMap || msg.payload?.togglesMap;
        if (togglesMap && typeof togglesMap[featureKey] === "boolean") {
          onUnlockedStateChange(togglesMap[featureKey]);
        }
      } else if (msg.event === "CONFIG_RESTORED" || msg.event === "SESSION_REVOKED") {
        checkServerStatus();
      }
    });

    // 2. Server polling for cross-device synchronization
    const checkServerStatus = async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.toggles) {
            // Server is always authoritative — store its state locally for UI purposes only
            syncLocalTogglesFromServer(data.toggles, data.globalEpoch);
          }
          if (data.docToggles && typeof data.docToggles[featureKey as keyof typeof data.docToggles] === "boolean") {
            onUnlockedStateChange(data.docToggles[featureKey as keyof typeof data.docToggles]);
          }
        }
      } catch {
        // Ignore network errors during background poll
      }
    };

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkServerStatus();
      }
    }, pollIntervalMs);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [featureKey, pollIntervalMs, onUnlockedStateChange]);
}

/**
 * Stores server-authoritative toggle state in localStorage & cookie for UI purposes only.
 * The server is ALWAYS the authoritative source — no client-side LWW merge is performed.
 * The server no longer reads this cookie for toggle decisions (security fix).
 */
export function syncLocalToggles(serverToggles: any, serverEpoch: number) {
  syncLocalTogglesFromServer(serverToggles, serverEpoch);
}

function syncLocalTogglesFromServer(serverToggles: any, serverEpoch: number) {
  if (typeof window === "undefined" || !serverToggles) return;

  // Server is authoritative — always overwrite local state with server's state
  const payload = {
    toggles: serverToggles,
    globalEpoch: serverEpoch || 0
  };

  try {
    localStorage.setItem("hajat_toggles_state", JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (private mode, storage full, etc.)
  }

  // Cookie is written for legacy compatibility only — server no longer trusts it
  try {
    document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore cookie write errors
  }
}
