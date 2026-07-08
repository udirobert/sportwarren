/**
 * V3Reveal — lightweight scroll-reveal wrapper for the V3 Risograph register.
 *
 * Uses IntersectionObserver to fade-in + slide-up elements on scroll.
 * Zero dependencies (no framer-motion), minimal bundle cost.
 *
 * Usage:
 *   <V3Reveal delay={100}>
 *     <SomeV3Component />
 *   </V3Reveal>
 *
 * The wrapper is a 'use client' boundary — wrap around server components
 * when using it in server-rendered pages.
 */
'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface V3RevealProps {
  children: React.ReactNode;
  /** Delay in ms before the reveal animation fires (for staggered sequences). Default 0. */
  delay?: number;
  /** Slide distance in px. Default 12. */
  distance?: number;
  /** Intersection threshold (0-1). Default 0.15. */
  threshold?: number;
  /** When true, re-triggers every time the element scrolls out and back in. Default false. */
  repeat?: boolean;
  /** Render as this tag. Default 'div'. */
  as?: React.ElementType;
  className?: string;
}

export function V3Reveal({
  children,
  delay = 0,
  distance = 12,
  threshold = 0.15,
  repeat = false,
  as: Tag = 'div',
  className,
}: V3RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!repeat) observer.unobserve(el);
        } else if (repeat) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, repeat]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
