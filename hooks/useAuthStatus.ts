"use client";

import { useEffect, useState, useCallback } from "react";

export type AuthStatusState = {
  cvUnlocked: boolean;
  vaultUnlocked: boolean;
  eclUnlocked: boolean;
  loading: boolean;
};

export function useAuthStatus() {
  const [status, setStatus] = useState<AuthStatusState>({
    cvUnlocked: false,
    vaultUnlocked: false,
    eclUnlocked: false,
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
  }, [fetchStatus]);

  return {
    ...status,
    refetchAuthStatus: fetchStatus
  };
}
