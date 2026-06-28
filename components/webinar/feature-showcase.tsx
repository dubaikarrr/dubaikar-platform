"use client";

import { useState } from "react";
import { MessageSquareText, FileText, MapPinned, Users, Check, MousePointerClick } from "lucide-react";
import { WEBINAR_FEATURES } from "@/lib/webinar";
import { ResumeDemo } from "@/components/webinar/demos/resume-demo";
import { NotesDemo } from "@/components/webinar/demos/notes-demo";
import { MapDemo } from "@/components/webinar/demos/map-demo";
import { CommunityDemo } from "@/components/webinar/demos/community-demo";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof FileText> = {
  interview: MessageSquareText,
  resume: FileText,
  explore: MapPinned,
  community: Users,
};

const DEMOS: Record<string, () => React.ReactElement> = {
  interview: NotesDemo,
  resume: ResumeDemo,
  explore: MapDemo,
  community: CommunityDemo,
};

// Which tabs are genuinely interactive (drives the "Try it live" badge).
const LIVE = new Set(["interview", "resume"]);

export function FeatureShowcase() {
  const [active, setActive] = useState(WEBINAR_FEATURES[0].key);
  const feature = WEBINAR_FEATURES.find((f) => f.key === active)!;
  const Icon = ICONS[feature.key] ?? FileText;
  const Demo = DEMOS[feature.key];
  const isLive = LIVE.has(feature.key);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {WEBINAR_FEATURES.map((f) => {
          const TabIcon = ICONS[f.key] ?? FileText;
          const on = f.key === active;
          return (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                on
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
              )}
            >
              <TabIcon className="h-4 w-4" /> {f.tab}
            </button>
          );
        })}
      </div>

      {/* Active panel: live demo on one side, value points on the other */}
      <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* Demo / visual */}
          <div className="border-b border-border bg-surface-2 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">
                  <MousePointerClick className="h-3.5 w-3.5" /> Try it live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
                  Live preview
                </span>
              )}
              <span className="text-xs text-text-subtle">
                {isLive ? "Go ahead, edit it" : "A peek at the real thing"}
              </span>
            </div>
            {Demo ? <Demo /> : null}
          </div>

          {/* Value points */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-text">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.blurb}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {feature.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
