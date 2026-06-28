"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Check, X, Clock, Mail, Send } from "lucide-react";
import type { FeedPost } from "@/lib/actions/community";
import { createPost } from "@/lib/actions/community";
import type { Member, ConnectionRequest } from "@/lib/actions/connections";
import { requestConnection, respondConnection } from "@/lib/actions/connections";
import { PostCard, timeAgo } from "@/components/community/post-card";
import { STAGE_META } from "@/lib/journey";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/field";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
  myMoveDate: string | null;
  myIndustry: string | null;
  posts: FeedPost[];
  members: Member[];
  requests: ConnectionRequest[];
  initialTab?: string;
}

export function CommunityClient({ myId, myMoveDate, myIndustry, posts, members, requests, initialTab }: Props) {
  const [tab, setTab] = useState(initialTab === "requests" || initialTab === "people" ? initialTab : "feed");
  const [category, setCategory] = useState("all");
  const router = useRouter();

  const visible = category === "all" ? posts : posts.filter((p) => p.category === category);

  return (
    <div className="space-y-4">
      <div className="tabs">
        {[
          { key: "feed", label: "Feed" },
          { key: "people", label: `People (${members.length})` },
          { key: "requests", label: requests.length ? `Requests (${requests.length})` : "Requests" },
        ].map((t) => (
          <button key={t.key} className={cn("tab", tab === t.key && "active")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className="mx-auto max-w-2xl space-y-4">
          <Composer onPosted={() => router.refresh()} />
          <SegmentedTabs tabs={CATEGORIES} value={category} onChange={setCategory} className="max-w-full overflow-x-auto" />
          {visible.length === 0 ? (
            <EmptyState
              title={category === "all" ? "No posts yet" : "Nothing in this category yet"}
              description="Be the first, ask a question or share a win from your Dubai journey."
            />
          ) : (
            visible.map((p) => <PostCard key={p.id} post={p} myId={myId} />)
          )}
        </div>
      )}

      {tab === "people" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.length === 0 ? (
            <EmptyState className="sm:col-span-2 lg:col-span-3" title="No other members yet" description="Invite people, they'll show up here." />
          ) : (
            members.map((m) => (
              <PersonCard key={m.id} member={m} myMoveDate={myMoveDate} myIndustry={myIndustry} />
            ))
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="mx-auto max-w-xl space-y-3">
          {requests.length === 0 ? (
            <EmptyState title="No pending requests" description="Connection requests from other members appear here." />
          ) : (
            requests.map((r) => <RequestRow key={r.id} request={r} />)
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- composer ----------------------------- */
function Composer({ onPosted }: { onPosted: () => void }) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("questions");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createPost(category, body);
      if (r.ok) { setBody(""); onPosted(); }
      else setError(r.error ?? "Failed to post.");
    });
  }

  return (
    <div className="card space-y-2 p-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ask a question, share a tip, or celebrate a win…"
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="!w-44">
          {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </Select>
        <Button className="ml-auto" size="sm" onClick={submit} disabled={pending || body.trim().length < 2}>
          <Send className="h-4 w-4" /> Post
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- person card ----------------------------- */
function matchHints(m: Member, myMoveDate: string | null, myIndustry: string | null): string[] {
  const hints: string[] = [];
  if (myMoveDate && m.target_move_date) {
    const a = new Date(myMoveDate); const b = new Date(m.target_move_date);
    const months = Math.abs((a.getFullYear() - b.getFullYear()) * 12 + a.getMonth() - b.getMonth());
    if (months === 0) hints.push("Moving the same month");
    else if (months <= 2) hints.push("Moving around the same time");
  }
  if (myIndustry && m.industry && myIndustry === m.industry) hints.push("Same industry");
  return hints;
}

function PersonCard({ member, myMoveDate, myIndustry }: { member: Member; myMoveDate: string | null; myIndustry: string | null }) {
  const [state, setState] = useState(member.connState);
  const [pending, startTransition] = useTransition();
  const hints = matchHints(member, myMoveDate, myIndustry);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={member.full_name} src={member.avatar_url} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{member.full_name ?? "Member"}</p>
          <p className="truncate text-xs text-text-muted">
            {[STAGE_META[member.current_stage]?.label, member.industry].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {hints.length ? (
        <div className="flex flex-wrap gap-1.5">
          {hints.map((h) => <Badge key={h} tone="success" className="!text-[10px]">{h}</Badge>)}
        </div>
      ) : null}
      {state === "accepted" && member.email ? (
        <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
          <Mail className="h-3.5 w-3.5" /> {member.email}
        </a>
      ) : null}
      <div className="mt-auto">
        {state === "none" || state === "declined" ? (
          <Button size="sm" variant="secondary" block disabled={pending}
            onClick={() => { setState("pending-sent"); startTransition(() => requestConnection(member.id).then(() => {})); }}>
            <UserPlus className="h-4 w-4" /> Connect
          </Button>
        ) : state === "pending-sent" ? (
          <Button size="sm" variant="ghost" block disabled><Clock className="h-4 w-4" /> Requested</Button>
        ) : state === "pending-received" ? (
          <Badge tone="info">Sent you a request, see Requests tab</Badge>
        ) : (
          <Badge tone="success" dot>Connected</Badge>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- request row ----------------------------- */
function RequestRow({ request }: { request: ConnectionRequest }) {
  const [done, setDone] = useState<null | "accepted" | "declined">(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="card flex items-center gap-3 p-4">
      <Avatar name={request.requester?.full_name} src={request.requester?.avatar_url} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{request.requester?.full_name ?? "Member"}</p>
        <p className="text-xs text-text-subtle">
          {request.requester ? STAGE_META[request.requester.current_stage]?.label : ""} · {timeAgo(request.created_at)}
        </p>
      </div>
      {done ? (
        <Badge tone={done === "accepted" ? "success" : "neutral"}>{done === "accepted" ? "Connected" : "Declined"}</Badge>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" disabled={pending}
            onClick={() => { setDone("accepted"); startTransition(() => respondConnection(request.id, true).then(() => router.refresh())); }}>
            <Check className="h-4 w-4" /> Accept
          </Button>
          <Button size="sm" variant="ghost" disabled={pending}
            onClick={() => { setDone("declined"); startTransition(() => respondConnection(request.id, false).then(() => {})); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
