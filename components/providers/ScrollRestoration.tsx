"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollRestoration() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const currentPath = pathname;
    const prevPath = prevPathnameRef.current;
    const isRouteChange = prevPath !== null && prevPath !== currentPath;

    const storageKey = `portfolio_scroll_${currentPath}`;
    const bottomKey = `portfolio_scroll_at_bottom_${currentPath}`;

    // If navigating to a different route, erase scroll memory for both previous and new route
    if (isRouteChange) {
      if (prevPath) {
        sessionStorage.removeItem(`portfolio_scroll_${prevPath}`);
        sessionStorage.removeItem(`portfolio_scroll_at_bottom_${prevPath}`);
      }
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(bottomKey);
    }

    prevPathnameRef.current = currentPath;

    const targetHash = sessionStorage.getItem("portfolio_scroll_target_hash");
    const forceTop = sessionStorage.getItem("portfolio_scroll_target_top") === "true";

    const savedScrollPos = sessionStorage.getItem(storageKey);
    const wasAtBottom = sessionStorage.getItem(bottomKey) === "true";

    // Track user manual scrolling interaction and instantly release scroll locks
    let userInteracted = false;
    const timeouts: NodeJS.Timeout[] = [];
    let resizeObserver: ResizeObserver | null = null;

    const cancelRestorationLocks = () => {
      userInteracted = true;
      timeouts.forEach(clearTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };

    window.addEventListener("wheel", cancelRestorationLocks, { passive: true });
    window.addEventListener("touchmove", cancelRestorationLocks, { passive: true });
    window.addEventListener("pointerdown", cancelRestorationLocks, { passive: true });

    const getDocHeight = () => Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );

    const performRestore = () => {
      if (userInteracted) return;
      if (document.body.style.position === "fixed") return;

      if (forceTop || (isRouteChange && !targetHash)) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        sessionStorage.removeItem("portfolio_scroll_target_top");
        return;
      }

      if (targetHash) {
        sessionStorage.removeItem("portfolio_scroll_target_hash");
        const performInstantTargetScroll = () => {
          if (userInteracted) return;
          const el = document.getElementById(targetHash);
          if (el) {
            const yOffset = -104;
            const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY + yOffset);
            window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
          }
        };

        performInstantTargetScroll();
        requestAnimationFrame(performInstantTargetScroll);
        return;
      }

      const docHeight = getDocHeight();
      const maxScroll = Math.max(0, docHeight - window.innerHeight);

      if (wasAtBottom && maxScroll > 0) {
        window.scrollTo({ top: maxScroll, left: 0, behavior: "instant" as ScrollBehavior });
      } else if (savedScrollPos) {
        const targetY = parseInt(savedScrollPos, 10);
        if (!isNaN(targetY) && targetY > 0) {
          const clampedY = Math.min(targetY, maxScroll > 0 ? maxScroll : targetY);
          window.scrollTo({ top: clampedY, left: 0, behavior: "instant" as ScrollBehavior });
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
    };

    // Perform initial restore immediately
    performRestore();
    requestAnimationFrame(performRestore);

    const hasSavedState = !!savedScrollPos || wasAtBottom || !!targetHash;
    if (hasSavedState) {
      const delays = [30, 80, 150, 300, 600, 1000, 1800, 2500];
      delays.forEach((delay) => {
        timeouts.push(setTimeout(performRestore, delay));
      });

      if (typeof ResizeObserver !== "undefined" && document.body) {
        resizeObserver = new ResizeObserver(() => {
          performRestore();
        });
        resizeObserver.observe(document.body);
        setTimeout(() => resizeObserver?.disconnect(), 3500);
      }
    }

    let scrollSaveTimer: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (document.body.style.position === "fixed") return;

      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        const docHeight = getDocHeight();
        const maxScrollY = Math.max(0, docHeight - window.innerHeight);

        const atBottom = maxScrollY > 0 && currentY >= maxScrollY - 70;

        sessionStorage.setItem(storageKey, currentY.toString());
        sessionStorage.setItem(bottomKey, atBottom ? "true" : "false");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleScroll);

    return () => {
      timeouts.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("wheel", cancelRestorationLocks);
      window.removeEventListener("touchmove", cancelRestorationLocks);
      window.removeEventListener("pointerdown", cancelRestorationLocks);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleScroll);
    };
  }, [pathname]);

  return null;
}
