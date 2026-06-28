"use client";

import { useTransition } from "react";
import { Circle } from "lucide-react";
import { TaskRow } from "@/components/ui/task-row";
import { toggleJourneyStep } from "@/lib/actions/journey";
import { stepHref } from "@/lib/step-links";
import type { JourneyStep } from "@/lib/database.types";
import { STAGE_META } from "@/lib/journey";

export function NextSteps({ steps }: { steps: JourneyStep[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={pending ? "space-y-2 opacity-60" : "space-y-2"}>
      {steps.map((step) => (
        <TaskRow
          key={step.id}
          title={step.label}
          description={STAGE_META[step.stage].label}
          href={stepHref(step.step_key)}
          icon={<Circle className="h-4 w-4" />}
          action={
            <button
              onClick={(e) => {
                e.preventDefault();
                startTransition(() => toggleJourneyStep(step.id, true));
              }}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted hover:bg-surface-2"
            >
              Mark done
            </button>
          }
        />
      ))}
    </div>
  );
}
