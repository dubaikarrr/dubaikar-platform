"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + lifts its children into view on scroll. No-JS safe: the hiding class
 * is only applied after mount, so server-rendered content is always visible.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const state = !mounted ? "" : shown ? "reveal-shown" : "reveal-hidden";
  return (
    <div ref={ref} className={`${state} ${className}`} style={shown ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
