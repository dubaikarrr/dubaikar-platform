import { cn } from "@/lib/utils";
import type { AtsResult } from "@/lib/tools/ats";

function tone(score: number) {
  if (score >= 75) return { color: "var(--success)", soft: "var(--success-soft)" };
  if (score >= 50) return { color: "var(--warning)", soft: "var(--warning-soft)" };
  return { color: "var(--danger)", soft: "var(--danger-soft)" };
}

export function AtsBadge({ score, label }: { score: number; label?: string }) {
  const t = tone(score);
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-medium"
        style={{ borderColor: t.color, color: t.color }}
      >
        {score}
      </div>
      <div>
        <p className="text-sm font-medium text-text">{label ?? "ATS score"}</p>
        <p className="text-xs text-text-muted">out of 100</p>
      </div>
    </div>
  );
}

export function AtsCategories({ result }: { result: AtsResult }) {
  const cats = [
    { n: "Personal details", p: result.categories.personal },
    { n: "Impact & keywords", p: result.categories.impact },
    { n: "Formatting", p: result.categories.formatting },
    { n: "Content quality", p: result.categories.content },
  ];
  return (
    <div className="space-y-2">
      {cats.map((c) => {
        const t = tone(c.p);
        return (
          <div key={c.n} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 text-text-muted">{c.n}</span>
            <span className="h-1.5 flex-1 rounded-full bg-surface-2">
              <span
                className="block h-full rounded-full"
                style={{ width: `${c.p}%`, background: t.color }}
              />
            </span>
            <span className="w-8 text-right" style={{ color: t.color }}>
              {c.p}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AtsIssues({ result }: { result: AtsResult }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {result.issues.map((i, idx) => (
        <span
          key={idx}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px]",
            i.type === "good" && "bg-success-soft text-success",
            i.type === "bad" && "bg-danger-soft text-danger",
            i.type === "warn" && "bg-warning-soft text-warning",
          )}
        >
          {i.msg}
        </span>
      ))}
    </div>
  );
}
