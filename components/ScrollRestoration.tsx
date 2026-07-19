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

    // Track user manual scrolling interaction after paint delay
    let userInteracted = false;
    const mountTime = Date.now();

    const handleInteraction = () => {
      if (Date.now() - mountTime < 180) return;
      userInteracted = true;
    };

    window.addEventListener("wheel", handleInteraction, { passive: true });
    window.addEventListener("touchmove", handleInteraction, { passive: true });

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
        const el = document.getElementById(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: "instant" as ScrollBehavior });
          setTimeout(() => {
            if (!userInteracted) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }, 80);
          sessionStorage.removeItem("portfolio_scroll_target_hash");
        }
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

    // Staggered restorations only for F5 refresh or hash target
    const hasSavedState = !!savedScrollPos || wasAtBottom || !!targetHash;
    const timeouts: NodeJS.Timeout[] = [];
    let resizeObserver: ResizeObserver | null = null;

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

    const handleScroll = () => {
      if (document.body.style.position === "fixed") return;

      const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = getDocHeight();
      const maxScrollY = Math.max(0, docHeight - window.innerHeight);

      const atBottom = maxScrollY > 0 && currentY >= maxScrollY - 70;

      sessionStorage.setItem(storageKey, currentY.toString());
      sessionStorage.setItem(bottomKey, atBottom ? "true" : "false");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleScroll);

    return () => {
      timeouts.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("wheel", handleInteraction);
      window.removeEventListener("touchmove", handleInteraction);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleScroll);
    };
  }, [pathname]);

  return null;
}
