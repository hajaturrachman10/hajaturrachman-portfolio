"use client";

import { useEffect, useState, useCallback } from "react";

export function useLockoutTimer(initialSeconds = 0) {
  const [lockoutSeconds, setLockoutSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const startLockout = useCallback((seconds: number) => {
    setLockoutSeconds(seconds);
  }, []);

  const clearLockout = useCallback(() => {
    setLockoutSeconds(0);
  }, []);

  return {
    lockoutSeconds,
    isLockedOut: lockoutSeconds > 0,
    startLockout,
    clearLockout
  };
}
