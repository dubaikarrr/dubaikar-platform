"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AREAS, DENSITY_LABEL, type MapArea } from "@/lib/map/areas";
import { HUBS, COMMUTE } from "@/lib/map/commute";
import { formatAED } from "@/lib/currency";
import { Select } from "@/components/ui/field";

interface ComparePanelProps {
  a: MapArea;
  initialB?: MapArea | null;
  onClose: () => void;
}

function Cell({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-3 py-2 text-sm ${strong ? "font-medium text-text" : "text-text-muted"}`}>{children}</td>;
}

export function ComparePanel({ a, initialB, onClose }: ComparePanelProps) {
  const [bSlug, setBSlug] = useState(initialB?.slug ?? AREAS.find((x) => x.slug !== a.slug)!.slug);
  const [hub, setHub] = useState("downtown");
  const b = AREAS.find((x) => x.slug === bSlug)!;

  const ca = COMMUTE[a.slug]?.[hub];
  const cb = COMMUTE[b.slug]?.[hub];

  const rows: [string, React.ReactNode, React.ReactNode][] = [
    ["Bed space", formatAED(a.rent.sharing), formatAED(b.rent.sharing)],
    ["Studio", formatAED(a.rent.studio), formatAED(b.rent.studio)],
    ["1 BHK", formatAED(a.rent.oneBhk), formatAED(b.rent.oneBhk)],
    ["Indian community", DENSITY_LABEL[a.indianDensity], DENSITY_LABEL[b.indianDensity]],
    [
      "Commute (car)",
      ca ? `~${ca.car} min` : "-",
      cb ? `~${cb.car} min` : "-",
    ],
    [
      "Commute (metro)",
      ca?.metro != null ? `~${ca.metro} min` : "No metro",
      cb?.metro != null ? `~${cb.metro} min` : "No metro",
    ],
    ["Vibe", a.vibe, b.vibe],
  ];

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 max-h-[88dvh] w-full overflow-hidden rounded-t-2xl border border-border bg-surface shadow-pop sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-none sm:w-[560px] sm:max-w-[calc(100%-24px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-card)]">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-text">Compare areas</h2>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="app-scroll max-h-[70vh] overflow-auto p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex-1 text-sm font-medium text-text">{a.name}</span>
          <span className="text-xs text-text-subtle">vs</span>
          <Select value={bSlug} onChange={(e) => setBSlug(e.target.value)} className="input-sm !w-44">
            {AREAS.filter((x) => x.slug !== a.slug).map((x) => (
              <option key={x.slug} value={x.slug}>{x.name}</option>
            ))}
          </Select>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-text-subtle">Commute to</span>
          <Select value={hub} onChange={(e) => setHub(e.target.value)} className="input-sm !w-48">
            {HUBS.map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
          </Select>
        </div>
        <table className="w-full border-collapse overflow-hidden rounded-[var(--radius-control)] border border-border">
          <thead>
            <tr className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 font-medium"></th>
              <th className="px-3 py-2 font-medium">{a.name}</th>
              <th className="px-3 py-2 font-medium">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, va, vb]) => (
              <tr key={label} className="border-t border-border align-top">
                <Cell strong>{label}</Cell>
                <Cell>{va}</Cell>
                <Cell>{vb}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
