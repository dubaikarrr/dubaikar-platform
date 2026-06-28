"use client";

import { MapPinned, Train, GraduationCap, Wallet } from "lucide-react";

const PILLS = [
  { label: "Bur Dubai · 1BHK ₹1.6L", top: "30%", left: "46%" },
  { label: "Karama · very Indian", top: "52%", left: "55%" },
  { label: "JLT · ₹2.1L", top: "70%", left: "26%" },
];

/**
 * Lightweight stylised Dubai map (self-contained SVG, never breaks).
 * The real /app/map is fully interactive; this is an on-brand preview.
 */
export function MapDemo() {
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[var(--radius-control)] border border-border shadow-sm">
        <svg viewBox="0 0 320 230" className="h-[240px] w-full" preserveAspectRatio="xMidYMid slice">
          {/* land */}
          <rect width="320" height="230" fill="#eef0f4" />
          {/* the sea (Dubai's coast runs NE to SW) */}
          <path d="M0,230 L0,150 L120,40 L80,0 L0,0 Z" fill="#cfe3f2" />
          {/* creek */}
          <path d="M120,42 q40,30 30,70 q-8,30 -40,40" fill="none" stroke="#cfe3f2" strokeWidth="10" strokeLinecap="round" />
          {/* roads grid */}
          {[60, 110, 160, 210, 260].map((x) => (
            <line key={x} x1={x} y1="0" x2={x - 40} y2="230" stroke="#dfe2e8" strokeWidth="2" />
          ))}
          {[60, 110, 160, 210].map((y) => (
            <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#dfe2e8" strokeWidth="2" />
          ))}
          {/* metro red line */}
          <path d="M40,200 L150,80 L300,40" fill="none" stroke="#E2231A" strokeWidth="3.5" strokeLinecap="round" />
          {/* metro green line */}
          <path d="M180,210 L210,120 L280,70" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
          {/* blue line 2029 (dashed) */}
          <path d="M150,80 L230,150 L300,150" fill="none" stroke="#1E6FE0" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
          {/* area dots */}
          {[[150, 80, "#DC2626"], [180, 120, "#EA580C"], [95, 165, "#EA580C"], [235, 95, "#D97706"]].map(
            ([cx, cy, c], i) => (
              <circle key={i} cx={cx as number} cy={cy as number} r="6" fill={c as string} stroke="#fff" strokeWidth="2.5" />
            ),
          )}
        </svg>
        {PILLS.map((p) => (
          <span
            key={p.label}
            className="absolute -translate-x-1/2 rounded-full border border-border bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow"
            style={{ top: p.top, left: p.left }}
          >
            {p.label}
          </span>
        ))}
        <span className="absolute bottom-1.5 right-2 text-[9px] text-slate-500">Preview · the live map is fully interactive</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: MapPinned, label: "15 areas mapped" },
          { icon: Train, label: "Metro reach" },
          { icon: GraduationCap, label: "CBSE/ICSE schools" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[var(--radius-control)] border border-border bg-surface p-2">
              <Icon className="mx-auto h-4 w-4 text-brand" />
              <p className="mt-1 text-[11px] text-text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface p-3">
        <Wallet className="h-4 w-4 shrink-0 text-brand" />
        <p className="text-xs text-text-muted">
          Plus a move-in budget calculator: see your first-month cost in <b className="text-text">AED and ₹</b>,
          prefilled from any area you pick.
        </p>
      </div>
    </div>
  );
}
