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
    // 1. Cross-tab event listener
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
            syncLocalToggles(data.toggles, data.globalEpoch);
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

export function syncLocalToggles(serverToggles: any, serverEpoch: number) {

  if (typeof window === "undefined" || !serverToggles) return;
  
  const raw = localStorage.getItem("hajat_toggles_state");
  let localData: any = null;
  if (raw) {
    try {
      localData = JSON.parse(raw);
    } catch {
      localData = null;
    }
  }

  if (localData && !localData.toggles) {
    localData = {
      toggles: Object.keys(localData).reduce((acc, key) => {
        acc[key] = { protected: localData[key], updatedAt: 0 };
        return acc;
      }, {} as any),
      globalEpoch: 0
    };
  }

  const merged = {
    toggles: { ...serverToggles },
    globalEpoch: Math.max(serverEpoch || 0, localData?.globalEpoch || 0)
  };

  if (localData?.toggles) {
    Object.keys(localData.toggles).forEach((key) => {
      const serverVal = serverToggles[key];
      const localVal = localData.toggles[key];
      if (serverVal && localVal) {
        const serverTime = Number(serverVal.updatedAt) || 0;
        const localTime = Number(localVal.updatedAt) || 0;
        
        if (localTime > serverTime) {
          merged.toggles[key] = {
            protected: localVal.protected,
            updatedAt: localTime
          };
        }
      }
    });
  }

  localStorage.setItem("hajat_toggles_state", JSON.stringify(merged));
  document.cookie = `hajat_toggles_state=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=31536000; SameSite=Lax`;
}
