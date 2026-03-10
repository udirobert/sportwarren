"use client";

import { useEffect, useRef, useCallback } from "react";

interface Options {
  onRefresh: () => void | Promise<void>;
  threshold?: number; // px to pull before triggering
  disabled?: boolean;
}

/**
 * Native pull-to-refresh using touch events.
 * Attach the returned `ref` to the scrollable container (or document body via null).
 * Uses overscroll-behavior: contain on the element to prevent browser default.
 */
export function usePullToRefresh({ onRefresh, threshold = 72, disabled = false }: Options) {
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const refreshing = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshing.current) return;
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === null || disabled) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 10) {
      pulling.current = true;
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(async (e: TouchEvent) => {
    if (startY.current === null || disabled) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    startY.current = null;
    if (pulling.current && dy >= threshold && !refreshing.current) {
      pulling.current = false;
      refreshing.current = true;
      try {
        await onRefresh();
      } finally {
        refreshing.current = false;
      }
    } else {
      pulling.current = false;
    }
  }, [disabled, threshold, onRefresh]);

  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current ?? document.documentElement;
    el.style.overscrollBehaviorY = "contain";
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return ref;
}
