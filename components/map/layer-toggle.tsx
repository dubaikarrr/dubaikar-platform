"use client";

import { useState } from "react";
import { ChevronDown, Compass } from "lucide-react";
import { AREAS } from "@/lib/map/areas";
import { cn } from "@/lib/utils";

export type LayerKey = "neighbourhoods" | "rent" | "metro" | "community" | "restaurants" | "landmarks";

export const LAYER_DEFS: { key: LayerKey; label: string; color: string }[] = [
  { key: "neighbourhoods", label: "Neighbourhoods", color: "#EA580C" },
  { key: "rent", label: "Rent heatmap", color: "#16A34A" },
  { key: "metro", label: "Metro lines", color: "#E2231A" },
  { key: "community", label: "Indian groceries · temples · schools", color: "#2563EB" },
  { key: "restaurants", label: "Indian restaurants", color: "#DB2777" },
  { key: "landmarks", label: "Landmarks, orient yourself", color: "#475569" },
];

const LEGEND: { color: string; label: string; dashed?: boolean }[] = [
  { color: "#DC2626", label: "Very high Indian community" },
  { color: "#EA580C", label: "High" },
  { color: "#D97706", label: "Mixed" },
  { color: "#E2231A", label: "Red Line (metro)" },
  { color: "#009639", label: "Green Line" },
  { color: "#1E6FE0", label: "Blue Line, opens 2029", dashed: true },
  { color: "#16A34A", label: "Indian grocery" },
  { color: "#D97706", label: "Temple / worship" },
  { color: "#2563EB", label: "CBSE/ICSE school" },
  { color: "#DB2777", label: "Indian restaurant" },
  { color: "#475569", label: "Landmark" },
];

export function LayerToggle({
  value,
  onToggle,
  onJump,
  onRetakeTour,
}: {
  value: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
  onJump?: (slug: string) => void;
  onRetakeTour?: () => void;
}) {
  const [showLegend, setShowLegend] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-20 w-[min(15rem,calc(100vw-1.5rem))] rounded-[var(--radius-card)] border border-border bg-surface/95 p-3 shadow-card backdrop-blur sm:w-64">
      {/* Mobile collapse toggle */}
      <button
        onClick={() => setOpenMobile((s) => !s)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-text-subtle sm:hidden"
      >
        Map layers
        <ChevronDown className={cn("h-4 w-4 transition-transform", openMobile && "rotate-180")} />
      </button>

      <div className={cn(openMobile ? "mt-3 block" : "hidden", "sm:mt-0 sm:block")}>
      {onJump ? (
        <select
          className="input input-sm mb-3"
          value=""
          onChange={(e) => { if (e.target.value) onJump(e.target.value); }}
          aria-label="Jump to area"
        >
          <option value="">Jump to an area…</option>
          {[...AREAS].sort((a, b) => a.name.localeCompare(b.name)).map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
      ) : null}

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">Map layers</p>
      <div className="space-y-1">
        {LAYER_DEFS.map((l) => {
          const on = value[l.key];
          return (
            <button
              key={l.key}
              onClick={() => onToggle(l.key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-1.5 text-left text-sm transition-colors",
                on ? "bg-surface-2 text-text" : "text-text-muted hover:bg-surface-2",
              )}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: l.color, opacity: on ? 1 : 0.35 }} />
              <span className="flex-1 text-[13px]">{l.label}</span>
              <span className={cn("h-3.5 w-6 rounded-full p-0.5 transition-colors", on ? "bg-brand" : "bg-border-strong")}>
                <span className={cn("block h-2.5 w-2.5 rounded-full bg-white transition-transform", on && "translate-x-2.5")} />
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowLegend((s) => !s)}
        className="mt-2 flex w-full items-center justify-between rounded-[var(--radius-control)] px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-text-subtle hover:bg-surface-2"
      >
        Legend
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showLegend && "rotate-180")} />
      </button>
      {showLegend ? (
        <div className="space-y-1 px-2 pb-1 pt-1">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[11px] text-text-muted">
              {l.dashed ? (
                <span className="h-0.5 w-3 shrink-0" style={{ background: `repeating-linear-gradient(90deg, ${l.color} 0 3px, transparent 3px 5px)` }} />
              ) : (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
              )}
              {l.label}
            </div>
          ))}
        </div>
      ) : null}

      {onRetakeTour ? (
        <button
          onClick={onRetakeTour}
          className="mt-2 flex w-full items-center gap-1.5 border-t border-border px-2 pt-2 text-xs text-brand hover:underline"
        >
          <Compass className="h-3.5 w-3.5" /> Retake the map tour
        </button>
      ) : null}
      </div>
    </div>
  );
}
