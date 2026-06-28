"use client";

import { X, ShoppingBasket, Landmark, GraduationCap, UtensilsCrossed, MapPin, Sparkles } from "lucide-react";
import type { MapPoi, PoiType } from "@/lib/map/pois";
import { POI_COLOR, POI_LABEL } from "@/lib/map/pois";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";

const TYPE_ICON: Record<PoiType, typeof MapPin> = {
  grocery: ShoppingBasket,
  temple: Sparkles,
  school: GraduationCap,
  restaurant: UtensilsCrossed,
  landmark: Landmark,
};

interface PoiCardProps {
  poi: MapPoi;
  onClose: () => void;
  /** Open the area this place sits in (if it's one of our 15). */
  onOpenArea?: (areaName: string) => void;
}

export function PoiCard({ poi, onClose, onOpenArea }: PoiCardProps) {
  const Icon = TYPE_ICON[poi.type];
  const color = POI_COLOR[poi.type];

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[82dvh] w-full overflow-auto rounded-t-2xl border border-border bg-surface shadow-pop sm:inset-x-auto sm:bottom-3 sm:right-3 sm:max-h-none sm:w-[320px] sm:max-w-[calc(100%-24px)] sm:overflow-visible sm:rounded-[var(--radius-card)]">
      <div className="flex items-start gap-3 p-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-white"
          style={{ background: color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug text-text">{poi.name}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm -mr-1 -mt-1 shrink-0" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color }}>
            {POI_LABEL[poi.type]}
          </p>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <p className="text-sm leading-relaxed text-text-muted">{poi.description}</p>

        {poi.type === "restaurant" && poi.priceForOne ? (
          <div className="rounded-[var(--radius-control)] bg-surface-2 px-3 py-2">
            <p className="text-xs text-text-subtle">Meal for one (typical)</p>
            <p className="text-sm font-medium text-text">
              ~{formatAED(poi.priceForOne)}{" "}
              <span className="font-normal text-text-subtle">≈ {formatINR(aedToInr(poi.priceForOne))}</span>
            </p>
          </div>
        ) : null}

        {poi.type === "school" && poi.feeRange ? (
          <div className="rounded-[var(--radius-control)] bg-surface-2 px-3 py-2">
            <p className="text-xs text-text-subtle">Yearly fees (indicative)</p>
            <p className="text-sm font-medium text-text">
              {formatAED(poi.feeRange[0])} – {formatAED(poi.feeRange[1])}{" "}
              <span className="font-normal text-text-subtle">≈ {formatINR(aedToInr(poi.feeRange[0]))} – {formatINR(aedToInr(poi.feeRange[1]))}</span>
            </p>
          </div>
        ) : null}

        {poi.knownFor ? (
          <p className="text-xs text-text-muted">
            <span className="font-medium text-text">Known for:</span> {poi.knownFor}
          </p>
        ) : null}

        {poi.area ? (
          onOpenArea ? (
            <button
              onClick={() => onOpenArea(poi.area!)}
              className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" /> in {poi.area}, see area details
            </button>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-text-subtle">
              <MapPin className="h-3.5 w-3.5" /> {poi.area}
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
