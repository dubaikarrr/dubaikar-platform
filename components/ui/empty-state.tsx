import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-subtle">
          {icon}
        </span>
      ) : null}
      <div>
        <h3 className="text-text">{title}</h3>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
