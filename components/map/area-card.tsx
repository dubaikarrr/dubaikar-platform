"use client";

import { useState } from "react";
import { X, MapPin, Train, Clock, Star, Car, GitCompareArrows, ChevronRight } from "lucide-react";
import type { MapArea } from "@/lib/map/areas";
import { DENSITY_COLOR, DENSITY_LABEL } from "@/lib/map/areas";
import { POIS, POI_LABEL, type MapPoi } from "@/lib/map/pois";
import { HUBS, COMMUTE } from "@/lib/map/commute";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { ButtonLink, Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

function RentRow({ label, aed }: { label: string; aed: number }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-right">
        <span className="font-medium text-text">{formatAED(aed)}</span>{" "}
        <span className="text-xs text-text-subtle">≈ {formatINR(aedToInr(aed))}</span>
      </span>
    </div>
  );
}

interface AreaCardProps {
  area: MapArea;
  onClose: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onCompare: () => void;
  onSelectPoi?: (poi: MapPoi) => void;
}

/** Rough distance in km between two lat/lng points (equirectangular, fine at city scale). */
function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const x = (bLng - aLng) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  const y = bLat - aLat;
  return Math.sqrt(x * x + y * y) * 111;
}

export function AreaCard({ area, onClose, bookmarked, onToggleBookmark, onCompare, onSelectPoi }: AreaCardProps) {
  const [hub, setHub] = useState("downtown");
  // Nearby Indian spots by proximity (no fragile name matching), nearest first.
  const nearby = POIS.filter((p) => p.type !== "landmark")
    .map((p) => ({ poi: p, d: distKm(area.lat, area.lng, p.lat, p.lng) }))
    .filter(({ d }) => d <= 3)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .map(({ poi }) => poi);
  const commute = COMMUTE[area.slug]?.[hub];
  const budgetHref = `/app/budget?rent=${area.rent.oneBhk}&area=${encodeURIComponent(area.name)}`;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex max-h-[82dvh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-pop sm:inset-x-auto sm:right-3 sm:top-3 sm:bottom-3 sm:max-h-none sm:w-[340px] sm:max-w-[calc(100%-24px)] sm:rounded-[var(--radius-card)]">
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <h2 className="text-text">{area.name}</h2>
          <span
            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: DENSITY_COLOR[area.indianDensity] + "22", color: DENSITY_COLOR[area.indianDensity] }}
          >
            <MapPin className="h-3 w-3" /> {DENSITY_LABEL[area.indianDensity]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleBookmark}
            className={cn("btn btn-ghost btn-icon btn-sm", bookmarked && "text-warning")}
            aria-label={bookmarked ? "Remove from shortlist" : "Add to shortlist"}
            title={bookmarked ? "Remove from shortlist" : "Add to shortlist"}
          >
            <Star className={cn("h-4 w-4", bookmarked && "fill-current")} />
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="app-scroll flex-1 space-y-4 overflow-auto p-4">
        <p className="text-sm text-text-muted">{area.vibe}</p>

        <div className="rounded-[var(--radius-control)] border border-border p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">Typical rent / month</p>
          <div className="space-y-1.5">
            <RentRow label="Bed space (sharing)" aed={area.rent.sharing} />
            <RentRow label="Studio" aed={area.rent.studio} />
            <RentRow label="1 BHK" aed={area.rent.oneBhk} />
          </div>
        </div>

        {/* Commute planner */}
        <div className="rounded-[var(--radius-control)] border border-border p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">Commute to</p>
          <Select value={hub} onChange={(e) => setHub(e.target.value)} className="input-sm mb-2">
            {HUBS.map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
          </Select>
          {commute ? (
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-text">
                <Car className="h-4 w-4 text-text-subtle" /> ~{commute.car} min
              </span>
              <span className="flex items-center gap-1.5 text-text">
                <Train className="h-4 w-4 text-text-subtle" />
                {commute.metro != null ? `~${commute.metro} min` : "No metro yet"}
              </span>
            </div>
          ) : (
            <p className="text-xs text-text-subtle">No estimate for this area yet.</p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-text-muted">{area.community}</p>
          <p className="flex items-start gap-2 text-text-muted"><Train className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" />{area.transport}</p>
          <p className="flex items-start gap-2 text-text-muted"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-subtle" />{area.commute}</p>
        </div>

        {nearby.length ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">Indian spots here</p>
            <div className="space-y-1">
              {nearby.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => onSelectPoi?.(p)}
                  className="flex w-full items-center justify-between rounded-[var(--radius-control)] px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-text">{p.name}</span>
                    <span className="block text-xs text-text-subtle">{POI_LABEL[p.type]}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-subtle" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {area.tags.map((t) => (
            <span key={t} className="pill" style={{ fontSize: 10 }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-3">
        <ButtonLink href={budgetHref} block>Use {area.name} rent in my budget</ButtonLink>
        <Button variant="secondary" block onClick={onCompare}>
          <GitCompareArrows className="h-4 w-4" /> Compare with another area
        </Button>
      </div>
    </div>
  );
}
