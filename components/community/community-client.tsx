"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { FeedPost } from "@/lib/actions/community";
import { createPost } from "@/lib/actions/community";
import { PostCard } from "@/components/community/post-card";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/field";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "questions", label: "Questions" },
  { key: "visa", label: "Visa" },
  { key: "housing", label: "Housing" },
  { key: "money", label: "Money" },
  { key: "life", label: "Life in Dubai" },
  { key: "wins", label: "Wins" },
];

interface Props {
  myId: string;
  posts: FeedPost[];
}

export function CommunityClient({ myId, posts }: Props) {
  const [category, setCategory] = useState("all");
  const router = useRouter();

  const visible = category === "all" ? posts : posts.filter((p) => p.category === category);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Composer onPosted={() => router.refresh()} />
      <SegmentedTabs
        tabs={CATEGORIES}
        value={category}
        onChange={setCategory}
        className="max-w-full overflow-x-auto"
      />
      {visible.length === 0 ? (
        <EmptyState
          title={category === "all" ? "No posts yet" : "Nothing in this category yet"}
          description="Be the first to ask a question or share a win from your Dubai journey."
        />
      ) : (
        visible.map((p) => <PostCard key={p.id} post={p} myId={myId} />)
      )}
    </div>
  );
}

function Composer({ onPosted }: { onPosted: () => void }) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("questions");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createPost(category, body);
      if (r.ok) {
        setBody("");
        onPosted();
      } else setError(r.error ?? "Failed to post.");
    });
  }

  return (
    <div className="card space-y-2 p-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ask a question, share a tip, or celebrate a win"
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="!w-44"
        >
          {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </Select>
        <Button
          className="ml-auto"
          size="sm"
          onClick={submit}
          disabled={pending || body.trim().length < 2}
        >
          <Send className="h-4 w-4" /> Post
        </Button>
      </div>
    </div>
  );
}
