"use client";

let openModalsCount = 0;
let savedScrollY = 0;

export function lockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (openModalsCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
  openModalsCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  openModalsCount = Math.max(0, openModalsCount - 1);

  if (openModalsCount === 0) {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }
}
