import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "info" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "",
  brand: "pill-accent",
  success: "pill-success",
  info: "pill-info",
  warning: "pill-warning",
  danger: "pill-danger",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

/** Status pill, match scores, application status, alerts. */
export function Badge({ className, tone = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn("pill", tones[tone], className)} {...props}>
      {dot ? <span className="pill-dot" /> : null}
      {children}
    </span>
  );
}
