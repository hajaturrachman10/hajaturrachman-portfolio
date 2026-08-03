"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeCrossTabSync } from "@/lib/crossTabSync";

export type AuthStatusState = {
  cvUnlocked: boolean;
  vaultUnlocked: boolean;
  eclUnlocked: boolean;
  overrides: {
    cv: boolean;
    vault: boolean;
    ecl: boolean;
  };
  loading: boolean;
};

export function useAuthStatus() {
  const [status, setStatus] = useState<AuthStatusState>({
    cvUnlocked: false,
    vaultUnlocked: false,
    eclUnlocked: false,
    overrides: {
      cv: false,
      vault: false,
      ecl: false
    },
    loading: true
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStatus({
          cvUnlocked: Boolean(data.cvUnlocked),
          vaultUnlocked: Boolean(data.vaultUnlocked),
          eclUnlocked: Boolean(data.eclUnlocked),
          overrides: {
            cv: Boolean(data.overrides?.cv),
            vault: Boolean(data.overrides?.vault),
            ecl: Boolean(data.overrides?.ecl)
          },
          loading: false
        });
      } else {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Subscribe to real-time cross-tab synchronization events
    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (
        msg.event === "TOGGLE_CHANGED" ||
        msg.event === "SESSION_REVOKED" ||
        msg.event === "CONFIG_RESTORED" ||
        msg.event === "PUBLIC_SESSION_INVALID" ||
        msg.event === "RESOURCE_LOCKED" ||
        msg.event === "RESOURCE_UNLOCKED"
      ) {
        fetchStatus();
      }
    });

    return () => unsubscribe();
  }, [fetchStatus]);

  return {
    ...status,
    refetchAuthStatus: fetchStatus
  };
}
