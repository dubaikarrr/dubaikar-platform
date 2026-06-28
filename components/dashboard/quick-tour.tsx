"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "dk-dashboard-tour-v1";

interface Step {
  title: string;
  body: string;
  emoji: string;
}

const STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Welcome to Dubaikar",
    body: "A 30-second tour of your dashboard. Skip any time.",
  },
  {
    emoji: "🗺️",
    title: "Your journey, six stages",
    body: "Plan to Settle. Tick steps as you complete them and watch your progress fill.",
  },
  {
    emoji: "✅",
    title: "Next steps, always visible",
    body: "We surface the 2-3 most useful things to do right now, based on what you've already done.",
  },
  {
    emoji: "🛠️",
    title: "Tools when you need them",
    body: "Budget planner, resume builder, Dubai map. Open from the sidebar any time.",
  },
  {
    emoji: "💬",
    title: "Ask the community",
    body: "Other movers and recent arrivals are in Community. Ask a question, share a win.",
  },
];

export function QuickTour({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (alwaysShow) {
      setOpen(true);
      return;
    }
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {}
  }, [alwaysShow]);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
    setOpen(false);
    setStep(0);
  }

  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard tour"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-2xl">
        <div className="text-4xl">{s.emoji}</div>
        <h2 className="mt-3 text-lg font-medium text-text">{s.title}</h2>
        <p className="mt-1 text-sm text-text-muted">{s.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-brand" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={close}>
              Skip
            </Button>
            {last ? (
              <Button size="sm" onClick={close}>
                <Check className="h-4 w-4" /> Done
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small inline button to re-open the tour on demand. */
export function RetakeTourButton() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand"
      >
        <Sparkles className="h-3.5 w-3.5" /> Take tour
      </button>
      {show ? <QuickTour alwaysShow /> : null}
    </>
  );
}
