import { cn } from "@/lib/utils";

/** Wordmark: "Dubai" in brand orange, "kar" in ink, matches the legacy site. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg font-medium tracking-tight", className)}>
      <span className="text-brand">Dubai</span>
      <span className="text-text">kar</span>
    </span>
  );
}
