"use client";

import { Heart, MessageCircle, UserPlus, CalendarCheck } from "lucide-react";

const POSTS = [
  { name: "Priya N.", stage: "Preparing", color: "#EA580C", text: "Got my degree attested in 9 days! Sharing the exact steps that worked.", likes: 24, replies: 6 },
  { name: "Arjun M.", stage: "Applying", color: "#0D9488", text: "Anyone in finance who moved to DIFC recently? Few interview questions to share.", likes: 18, replies: 11 },
];

export function CommunityDemo() {
  return (
    <div className="space-y-3">
      {POSTS.map((p) => (
        <div key={p.name} className="rounded-[var(--radius-control)] border border-border bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: p.color }}>
              {p.name[0]}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{p.name}</p>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{p.stage}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-700">{p.text}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {p.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {p.replies}</span>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
          <UserPlus className="h-3.5 w-3.5 text-brand" /> Connect with movers like you
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
          <CalendarCheck className="h-3.5 w-3.5 text-brand" /> Book a 1:1 with a CA
        </span>
      </div>
    </div>
  );
}
