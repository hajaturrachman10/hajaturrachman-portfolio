"use client";

import { useState, useCallback, useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
    lockScroll();
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    unlockScroll();
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        lockScroll();
      } else {
        unlockScroll();
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}
