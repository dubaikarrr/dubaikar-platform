"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, Bookmark } from "lucide-react";
import type { PostMeta } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";

export function KnowledgeList({
  posts,
  categories,
  savedSlugs,
}: {
  posts: PostMeta[];
  categories: string[];
  savedSlugs: string[];
}) {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const saved = useMemo(() => new Set(savedSlugs), [savedSlugs]);

  const filtered = posts.filter((p) => {
    if (active === "saved" && !saved.has(p.slug)) return false;
    if (active !== "all" && active !== "saved" && p.category !== active) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides…"
          className="input-sm !pl-9"
        />
      </div>
      <SegmentedTabs
        value={active}
        onChange={setActive}
        tabs={[
          { key: "all", label: "All" },
          ...categories.map((c) => ({ key: c, label: c })),
          { key: "saved", label: `Saved (${saved.size})` },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState
          title={active === "saved" ? "No saved guides yet" : "No guides match"}
          description={active === "saved" ? "Open a guide and hit Save to keep it here." : "Try a different search or category."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.slug} href={`/app/knowledge/${p.slug}`}>
              <Card className="hovcard h-full p-5">
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{p.category}</Badge>
                  {saved.has(p.slug) ? <Bookmark className="h-4 w-4 fill-current text-brand" /> : null}
                </div>
                <h2 className="mt-2 text-text">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{p.description}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-subtle">
                  <Clock className="h-3.5 w-3.5" /> {p.readingMinutes} min read
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
