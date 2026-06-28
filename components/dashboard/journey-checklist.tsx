"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import type { JourneyStep } from "@/lib/database.types";
import { STAGES, STAGE_META, type Stage } from "@/lib/journey";
import { toggleJourneyStep, advanceStage } from "@/lib/actions/journey";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JourneyChecklist({
  steps,
  currentStage,
}: {
  steps: JourneyStep[];
  currentStage: Stage;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ [currentStage]: true });
  const [local, setLocal] = useState(steps);
  const [pending, startTransition] = useTransition();

  const currentIdx = STAGES.indexOf(currentStage);
  const currentSteps = local.filter((s) => s.stage === currentStage);
  const currentDone = currentSteps.length > 0 && currentSteps.every((s) => s.completed);
  const nextStage = STAGES[currentIdx + 1];

  function toggle(step: JourneyStep) {
    setLocal((xs) => xs.map((x) => (x.id === step.id ? { ...x, completed: !x.completed } : x)));
    startTransition(() => toggleJourneyStep(step.id, !step.completed));
  }

  return (
    <div className="space-y-2">
      {STAGES.map((stage, i) => {
        const stageSteps = local.filter((s) => s.stage === stage);
        if (!stageSteps.length) return null;
        const done = stageSteps.filter((s) => s.completed).length;
        const isOpen = !!open[stage];
        const state = i < currentIdx ? "past" : i === currentIdx ? "current" : "future";

        return (
          <div key={stage} className={cn("rounded-[var(--radius-card)] border border-border bg-surface", state === "current" && "border-brand/40")}>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setOpen((o) => ({ ...o, [stage]: !o[stage] }))}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  state === "past" && "bg-success-soft text-success",
                  state === "current" && "bg-brand text-white",
                  state === "future" && "bg-surface-2 text-text-subtle",
                )}
              >
                {state === "past" ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-text">{STAGE_META[stage].label}</span>
                <span className="block text-xs text-text-subtle">{STAGE_META[stage].tagline}</span>
              </span>
              <span className="text-xs text-text-subtle">{done}/{stageSteps.length}</span>
              <ChevronDown className={cn("h-4 w-4 text-text-subtle transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen ? (
              <div className="space-y-1 border-t border-border p-3">
                {stageSteps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s)}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border",
                        s.completed ? "border-success bg-success text-white" : "border-border-strong",
                      )}
                      style={{ width: 18, height: 18 }}
                    >
                      {s.completed ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className={cn("text-text", s.completed && "text-text-muted line-through")}>{s.label}</span>
                  </button>
                ))}
                {stage === currentStage && currentDone && nextStage ? (
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    disabled={pending}
                    onClick={() => startTransition(() => advanceStage(currentStage))}
                  >
                    Advance to {STAGE_META[nextStage].label} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
