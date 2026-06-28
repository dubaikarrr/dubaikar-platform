"use client";

import { useState } from "react";
import { Compass, X, Star, ChevronRight, ArrowRight } from "lucide-react";
import { AREAS, DENSITY_LABEL, type MapArea } from "@/lib/map/areas";
import { HUBS, COMMUTE } from "@/lib/map/commute";
import { POIS } from "@/lib/map/pois";
import { formatAED } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type RoomType = "sharing" | "studio" | "oneBhk";
type Profile = "bachelor" | "couple" | "family";

const ROOM_LABEL: Record<RoomType, string> = { sharing: "Bed space (sharing)", studio: "Studio", oneBhk: "1 BHK" };

interface Scored {
  area: MapArea;
  score: number;
  reasons: string[];
}

/** Count schools within ~3km of an area (for family scoring). */
function schoolsNear(area: MapArea): number {
  return POIS.filter((p) => p.type === "school").filter((p) => {
    const x = (p.lng - area.lng) * Math.cos(area.lat * (Math.PI / 180));
    const y = p.lat - area.lat;
    return Math.sqrt(x * x + y * y) * 111 <= 3;
  }).length;
}

function scoreAreas(opts: {
  room: RoomType;
  budget: number;
  hub: string;
  profile: Profile;
  wantIndian: boolean;
}): Scored[] {
  return AREAS.map((area) => {
    const reasons: string[] = [];
    let score = 0;

    // Budget fit (most important).
    const rent = area.rent[opts.room];
    if (opts.budget > 0) {
      if (rent <= opts.budget) {
        score += 40;
        reasons.push(`${ROOM_LABEL[opts.room]} ${formatAED(rent)}, within budget`);
      } else if (rent <= opts.budget * 1.15) {
        score += 22;
        reasons.push(`${formatAED(rent)}, slightly over budget`);
      } else {
        score += Math.max(0, 18 - (rent - opts.budget) / 200);
      }
    } else {
      score += 15;
    }

    // Commute to chosen hub.
    const c = COMMUTE[area.slug]?.[opts.hub];
    if (c) {
      const best = c.metro != null ? Math.min(c.car, c.metro) : c.car;
      if (best <= 20) { score += 30; reasons.push(`~${best} min to ${HUBS.find((h) => h.key === opts.hub)?.label}`); }
      else if (best <= 35) { score += 20; reasons.push(`~${best} min commute`); }
      else { score += 8; reasons.push(`~${best} min commute (longer)`); }
      if (c.metro != null && c.metro <= 35) reasons.push("metro-connected");
    }

    // Indian community preference.
    if (opts.wantIndian) {
      const w = { "very-high": 22, high: 16, medium: 8, low: 2 }[area.indianDensity];
      score += w;
      if (area.indianDensity === "very-high" || area.indianDensity === "high") {
        reasons.push(DENSITY_LABEL[area.indianDensity].toLowerCase());
      }
    }

    // Profile fit.
    if (opts.profile === "family") {
      const schools = schoolsNear(area);
      if (schools > 0) { score += 14; reasons.push(`${schools} Indian school${schools > 1 ? "s" : ""} nearby`); }
      if (area.tags.includes("family")) { score += 8; reasons.push("family-friendly"); }
    } else if (opts.profile === "bachelor") {
      if (area.tags.includes("bachelor") || area.tags.includes("cheapest") || area.tags.includes("budget")) {
        score += 12; reasons.push("popular with bachelors");
      }
    } else {
      if (area.tags.includes("value") || area.tags.includes("central")) { score += 8; reasons.push("good for couples"); }
    }

    return { area, score, reasons: [...new Set(reasons)].slice(0, 3) };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function AreaFinder({
  onResults,
  onOpenArea,
  onShortlist,
  shortlist,
}: {
  onResults: (slugs: string[]) => void;
  onOpenArea: (slug: string) => void;
  onShortlist: (slug: string) => void;
  shortlist: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState<RoomType>("studio");
  const [budget, setBudget] = useState("");
  const [hub, setHub] = useState("downtown");
  const [profile, setProfile] = useState<Profile>("bachelor");
  const [wantIndian, setWantIndian] = useState(true);
  const [results, setResults] = useState<Scored[] | null>(null);

  function reset() {
    setStep(0);
    setResults(null);
    onResults([]);
  }

  function run() {
    const scored = scoreAreas({ room, budget: Number(budget) || 0, hub, profile, wantIndian });
    setResults(scored);
    onResults(scored.map((s) => s.area.slug));
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-surface/95 px-3 py-2 text-sm font-medium text-text shadow-card backdrop-blur hover:bg-surface-2"
      >
        <Compass className="h-4 w-4 text-brand" />
        <span className="hidden sm:inline">Help me choose an area</span>
        <span className="sm:hidden">Find area</span>
      </button>
    );
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 flex max-h-[85dvh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-pop sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:max-h-none sm:w-[320px] sm:max-w-[calc(100%-24px)] sm:rounded-[var(--radius-card)]">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-text">
          <Compass className="h-4 w-4 text-brand" /> Find your area
        </span>
        <button onClick={() => { setOpen(false); reset(); }} className="btn btn-ghost btn-icon btn-sm" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>

      <div className="app-scroll min-h-0 flex-1 overflow-auto p-4 sm:overflow-visible">
        {results ? (
          <div className="space-y-3">
            <p className="text-xs text-text-subtle">Your best matches, highlighted on the map.</p>
            {results.map((r, i) => (
              <div key={r.area.slug} className="rounded-[var(--radius-control)] border border-border p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-medium text-white">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-text">{r.area.name}</span>
                  <button
                    onClick={() => onShortlist(r.area.slug)}
                    className={cn("btn btn-ghost btn-icon btn-sm", shortlist.has(r.area.slug) && "text-warning")}
                    title="Add to shortlist"
                  >
                    <Star className={cn("h-4 w-4", shortlist.has(r.area.slug) && "fill-current")} />
                  </button>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {r.reasons.map((reason) => (
                    <li key={reason} className="text-xs text-text-muted">· {reason}</li>
                  ))}
                </ul>
                <button onClick={() => onOpenArea(r.area.slug)} className="mt-2 flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                  See details <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
            <Button variant="secondary" size="sm" block onClick={reset}>Start over</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* progress dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((s) => (
                <span key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-brand" : "bg-border-strong")} />
              ))}
            </div>

            {step === 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text">What's your housing budget?</p>
                <label className="block text-xs text-text-subtle">Room type</label>
                <Select value={room} onChange={(e) => setRoom(e.target.value as RoomType)} className="input-sm">
                  {(Object.keys(ROOM_LABEL) as RoomType[]).map((r) => <option key={r} value={r}>{ROOM_LABEL[r]}</option>)}
                </Select>
                <label className="block text-xs text-text-subtle">Monthly budget (AED)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 4000"
                  className="input input-sm"
                />
              </div>
            ) : step === 1 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text">Where will you work?</p>
                <Select value={hub} onChange={(e) => setHub(e.target.value)} className="input-sm">
                  {HUBS.map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
                </Select>
                <p className="text-xs text-text-subtle">We&apos;ll favour areas with a short commute there.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text">Who's moving?</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([["bachelor", "Bachelor"], ["couple", "Couple"], ["family", "Family + kids"]] as [Profile, string][]).map(([p, label]) => (
                    <button
                      key={p}
                      onClick={() => setProfile(p)}
                      className={cn("rounded-[var(--radius-control)] border px-2 py-2 text-xs", profile === p ? "border-brand bg-brand-soft text-brand" : "border-border text-text-muted hover:bg-surface-2")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-text">
                  <input type="checkbox" checked={wantIndian} onChange={(e) => setWantIndian(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
                  Prefer a strong Indian community
                </label>
              </div>
            )}

            <div className="flex gap-2">
              {step > 0 ? <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
              {step < 2 ? (
                <Button size="sm" className="ml-auto" onClick={() => setStep((s) => s + 1)}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" className="ml-auto" onClick={run}>Show my areas</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
