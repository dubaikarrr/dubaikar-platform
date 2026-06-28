"use client";

import { useState, useTransition } from "react";
import { Heart, MessageCircle, Flag, Trash2, Send } from "lucide-react";
import type { FeedPost, FeedReply } from "@/lib/actions/community";
import {
  toggleLike, getReplies, createReply, deletePost, deleteReply, reportTarget,
} from "@/lib/actions/community";
import { STAGE_META } from "@/lib/journey";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const CATEGORY_LABELS: Record<string, string> = {
  visa: "Visa", housing: "Housing", money: "Money", life: "Life in Dubai",
  wins: "Wins", questions: "Questions",
};

export function PostCard({ post, myId }: { post: FeedPost; myId: string }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<FeedReply[] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reported, setReported] = useState(false);
  const [gone, setGone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (gone) return null;
  const mine = post.user_id === myId;

  function onLike() {
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    startTransition(async () => { await toggleLike(post.id); });
  }
  async function openReplies() {
    setShowReplies((s) => !s);
    if (!replies) setReplies(await getReplies(post.id));
  }
  function sendReply() {
    const text = replyText.trim();
    if (!text) return;
    setReplyText("");
    startTransition(async () => {
      await createReply(post.id, text);
      setReplies(await getReplies(post.id));
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <Avatar name={post.author?.full_name} src={post.author?.avatar_url} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text">{post.author?.full_name ?? "Member"}</span>
            {post.author ? (
              <Badge tone="brand" className="!px-2 !py-0 text-[10px]">
                {STAGE_META[post.author.current_stage]?.label ?? post.author.current_stage}
              </Badge>
            ) : null}
            {post.author?.linkedin_url ? (
              <a
                href={post.author.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="text-text-subtle hover:text-brand"
                aria-label="LinkedIn profile"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
                </svg>
              </a>
            ) : null}
            <span className="text-xs text-text-subtle">· {timeAgo(post.created_at)}</span>
            <span className="ml-auto text-[11px] text-text-subtle">{CATEGORY_LABELS[post.category] ?? post.category}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text">{post.body}</p>

          <div className="mt-3 flex items-center gap-4">
            <button onClick={onLike} className={cn("flex items-center gap-1.5 text-sm", liked ? "text-danger" : "text-text-muted hover:text-text")}>
              <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likeCount || ""}
            </button>
            <button onClick={openReplies} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
              <MessageCircle className="h-4 w-4" /> {(replies?.length ?? post.replyCount) || ""}
            </button>
            <div className="ml-auto flex items-center gap-2">
              {mine ? (
                <button
                  title="Delete post"
                  className="text-text-subtle hover:text-danger"
                  onClick={() => { if (confirm("Delete this post?")) { setGone(true); startTransition(() => deletePost(post.id)); } }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  title={reported ? "Reported" : "Report"}
                  className={cn("text-text-subtle hover:text-warning", reported && "text-warning")}
                  onClick={() => { if (!reported) { setReported(true); startTransition(() => reportTarget("post", post.id).then(() => {})); } }}
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {showReplies ? (
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              {(replies ?? []).map((r) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <Avatar name={r.author?.full_name} src={r.author?.avatar_url} size={28} />
                  <div className="min-w-0 flex-1 rounded-[var(--radius-control)] bg-surface-2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text">{r.author?.full_name ?? "Member"}</span>
                      <span className="text-[10px] text-text-subtle">{timeAgo(r.created_at)}</span>
                      {r.user_id === myId ? (
                        <button className="ml-auto text-text-subtle hover:text-danger"
                          onClick={() => { startTransition(async () => { await deleteReply(r.id); setReplies(await getReplies(post.id)); }); }}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-text">{r.body}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-end gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="!min-h-10"
                  rows={1}
                />
                <Button size="sm" onClick={sendReply} disabled={pending || !replyText.trim()} iconOnly aria-label="Send reply">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
