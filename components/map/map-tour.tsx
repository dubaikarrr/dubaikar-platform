"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, Compass } from "lucide-react";
import { DUBAI_CENTER } from "@/lib/map/metro";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOUR_KEY = "dk-map-tour-v1";

export interface TourStep {
  title: string;
  body: string;
  flyTo?: [number, number];
  zoom?: number;
  demoArea?: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to Dubai 🇦🇪",
    body: "The whole city hugs one long coast road. Once you spot the coast and the metro lines, everything else clicks into place.",
    flyTo: DUBAI_CENTER, zoom: 10.2,
  },
  {
    title: "Where Indians live",
    body: "The orange and red areas are where the Indian community is strongest, groceries, temples, schools and tiffin services are all close by.",
    flyTo: [55.31, 25.255], zoom: 11.2,
  },
  {
    title: "The metro is your lifeline",
    body: "Red and Green lines cover most Indian areas; the dashed Blue Line opens in 2029. Living near a station saves you a car.",
    flyTo: [55.32, 25.23], zoom: 11,
  },
  {
    title: "Tap an area for the full picture",
    body: "Every neighbourhood shows rent in AED and ₹, commute times, and nearby Indian spots. Here's Karama, Dubai's classic Indian hub.",
    flyTo: [55.305, 25.246], zoom: 12.6, demoArea: "karama",
  },
  {
    title: "Build your shortlist",
    body: "Star the areas you like, they flow into your dashboard, budget and housing pages. Or hit ‘Help me choose an area’ and we'll suggest some.",
    flyTo: DUBAI_CENTER, zoom: 10.5,
  },
];

export function MapTour({ onStep }: { onStep: (step: TourStep) => void }) {
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(TOUR_KEY) === "done"; } catch {}
    if (!seen) {
      setActive(true);
      // fire the first step after the map settles
      const t = setTimeout(() => onStep(STEPS[0]), 400);
      return () => clearTimeout(t);
    }
  }, [onStep]);

  function finish() {
    try { localStorage.setItem(TOUR_KEY, "done"); } catch {}
    setActive(false);
  }

  function go(next: number) {
    if (next >= STEPS.length) return finish();
    setI(next);
    onStep(STEPS[next]);
  }

  if (!active) return null;
  const step = STEPS[i];

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center pb-8 sm:items-center sm:pb-0">
      <div className="pointer-events-auto w-[360px] max-w-[calc(100%-24px)] rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-pop">
        <div className="flex items-start justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand">
            <Compass className="h-3.5 w-3.5" /> Quick tour · {i + 1}/{STEPS.length}
          </span>
          <button onClick={finish} className="btn btn-ghost btn-icon btn-sm -mr-2 -mt-2" aria-label="Skip tour"><X className="h-4 w-4" /></button>
        </div>
        <h3 className="mt-2 text-text">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{step.body}</p>

        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.map((_, idx) => (
            <span key={idx} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-5 bg-brand" : "w-1.5 bg-border-strong")} />
          ))}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
            <Button size="sm" onClick={() => go(i + 1)}>
              {i === STEPS.length - 1 ? "Done" : "Next"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
