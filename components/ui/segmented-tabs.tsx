"use client";

import { cn } from "@/lib/utils";

export interface SegmentedTab {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export function SegmentedTabs({ tabs, value, onChange, className }: SegmentedTabsProps) {
  return (
    <div role="tablist" className={cn("seg flex-wrap", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={tab.key === value}
          onClick={() => onChange(tab.key)}
          className={tab.key === value ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
