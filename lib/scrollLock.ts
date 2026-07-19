"use client";

let openModalsCount = 0;
let savedScrollY = 0;

export function lockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (openModalsCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    document.body.setAttribute("data-locked-scroll-y", savedScrollY.toString());

    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
  openModalsCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  openModalsCount = Math.max(0, openModalsCount - 1);

  if (openModalsCount === 0) {
    const attrY = document.body.getAttribute("data-locked-scroll-y");
    const targetY = attrY !== null ? parseInt(attrY, 10) : savedScrollY;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflowY = "";
    document.body.removeAttribute("data-locked-scroll-y");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");

    window.scrollTo({
      top: targetY,
      left: 0,
      behavior: "instant" as ScrollBehavior
    });
  }
}
