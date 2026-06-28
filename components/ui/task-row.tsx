import * as React from "react";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  title: string;
  description?: string;
  href?: string;
  done?: boolean;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onToggle?: () => void;
  className?: string;
}

/** A single actionable step in a "next steps" list. */
export function TaskRow({
  title,
  description,
  href,
  done,
  icon,
  action,
  onToggle,
  className,
}: TaskRowProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          done ? "bg-success-soft text-success" : "bg-brand-soft text-brand",
        )}
      >
        {done ? <Check className="h-4 w-4" /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm font-medium text-text",
            done && "text-text-muted line-through",
          )}
        >
          {title}
        </span>
        {description ? (
          <span className="block truncate text-xs text-text-muted">
            {description}
          </span>
        ) : null}
      </span>
      {action ?? (href ? <ChevronRight className="h-4 w-4 text-text-subtle" /> : null)}
    </>
  );

  const rowClass = cn(
    "flex items-center gap-3 rounded-[var(--radius-control)] border border-border bg-surface p-3 transition-colors",
    href && "hover:bg-surface-2",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }
  if (onToggle) {
    return (
      <button onClick={onToggle} className={cn(rowClass, "w-full text-left")}>
        {content}
      </button>
    );
  }
  return <div className={rowClass}>{content}</div>;
}
