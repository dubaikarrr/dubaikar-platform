import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-medium text-text">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs text-text-subtle">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand">
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
