import { Check } from "lucide-react";
import { STAGES, STAGE_META, stageIndex, type Stage } from "@/lib/journey";
import { cn } from "@/lib/utils";

interface StageStripProps {
  current: Stage;
  className?: string;
  /** Show the per-stage tagline beneath each label (desktop). */
  showTaglines?: boolean;
}

/** The six-stage progress row. Done / current / upcoming states. */
export function StageStrip({
  current,
  className,
  showTaglines = false,
}: StageStripProps) {
  const currentIdx = stageIndex(current);

  return (
    <ol className={cn("flex w-full items-start gap-2", className)}>
      {STAGES.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const meta = STAGE_META[stage];
        return (
          <li key={stage} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i === 0 ? "opacity-0" : done || active ? "bg-brand" : "bg-surface-2",
                )}
              />
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  done && "border-brand bg-brand text-white",
                  active &&
                    "border-brand bg-brand-soft text-brand ring-2 ring-brand/30",
                  !done && !active && "border-border bg-surface text-text-subtle",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i === STAGES.length - 1
                    ? "opacity-0"
                    : done
                      ? "bg-brand"
                      : "bg-surface-2",
                )}
              />
            </div>
            <div className="text-center">
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-text" : "text-text-muted",
                )}
              >
                {meta.label}
              </span>
              {showTaglines ? (
                <span className="mt-0.5 hidden text-[11px] text-text-subtle md:block">
                  {meta.tagline}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
