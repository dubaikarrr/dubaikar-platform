"use client";

import { useEffect, useState } from "react";

/** Live countdown to the webinar. Guarded against SSR/Date mismatch. */
export function Countdown({ target }: { target: string }) {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    const end = new Date(target).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!mounted || Number.isNaN(new Date(target).getTime())) return null;

  const units: [number, string][] = [
    [left.d, "days"], [left.h, "hrs"], [left.m, "min"], [left.s, "sec"],
  ];
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {units.map(([v, label]) => (
        <div key={label} className="min-w-0 flex-1 rounded-[var(--radius-control)] border border-border bg-surface px-2 py-2 text-center sm:min-w-[64px] sm:flex-none sm:px-3">
          <div className="text-xl font-semibold tabular-nums text-text sm:text-2xl">{String(v).padStart(2, "0")}</div>
          <div className="text-[11px] uppercase tracking-wide text-text-subtle">{label}</div>
        </div>
      ))}
    </div>
  );
}
