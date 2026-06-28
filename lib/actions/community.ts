"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/actions/notifications";
import type { CommunityPost, CommunityReply, MemberProfile } from "@/lib/database.types";

export interface FeedPost extends CommunityPost {
  author: MemberProfile | null;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
}

export interface FeedReply extends CommunityReply {
  author: MemberProfile | null;
}

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function membersById(ids: string[]): Promise<Map<string, MemberProfile>> {
  const { supabase } = await getUser();
  if (!ids.length) return new Map();
  const { data } = await supabase
    .from("member_directory")
    .select("*")
    .in("id", [...new Set(ids)]);
  return new Map(((data as MemberProfile[] | null) ?? []).map((m) => [m.id, m]));
}

/** Latest posts with authors, like/reply counts, and my-like flag. */
export async function getFeed(category?: string): Promise<FeedPost[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];

  let q = supabase
    .from("community_posts")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false })
    .limit(50);
  if (category && category !== "all") q = q.eq("category", category);
  const { data: posts } = await q;
  const list = (posts as CommunityPost[] | null) ?? [];
  if (!list.length) return [];

  const postIds = list.map((p) => p.id);
  const [authors, { data: likes }, { data: replies }] = await Promise.all([
    membersById(list.map((p) => p.user_id)),
    supabase.from("post_likes").select("post_id,user_id").in("post_id", postIds),
    supabase.from("community_replies").select("post_id").eq("deleted", false).in("post_id", postIds),
  ]);

  const likeCounts = new Map<string, number>();
  const myLikes = new Set<string>();
  for (const l of (likes as { post_id: string; user_id: string }[] | null) ?? []) {
    likeCounts.set(l.post_id, (likeCounts.get(l.post_id) ?? 0) + 1);
    if (l.user_id === user.id) myLikes.add(l.post_id);
  }
  const replyCounts = new Map<string, number>();
  for (const r of (replies as { post_id: string }[] | null) ?? []) {
    replyCounts.set(r.post_id, (replyCounts.get(r.post_id) ?? 0) + 1);
  }

  return list.map((p) => ({
    ...p,
    author: authors.get(p.user_id) ?? null,
    likeCount: likeCounts.get(p.id) ?? 0,
    replyCount: replyCounts.get(p.id) ?? 0,
    likedByMe: myLikes.has(p.id),
  }));
}

export async function createPost(category: string, body: string) {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const text = body.trim();
  if (text.length < 2) return { ok: false, error: "Write something first." };
  if (text.length > 4000) return { ok: false, error: "Post is too long (4000 chars max)." };
  const { error } = await supabase
    .from("community_posts")
    .insert({ user_id: user.id, category, body: text });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/community");
  return { ok: true };
}

export async function deletePost(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from("community_posts").update({ deleted: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/community");
}

export async function getReplies(postId: string): Promise<FeedReply[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("community_replies")
    .select("*")
    .eq("post_id", postId)
    .eq("deleted", false)
    .order("created_at", { ascending: true });
  const list = (data as CommunityReply[] | null) ?? [];
  const authors = await membersById(list.map((r) => r.user_id));
  return list.map((r) => ({ ...r, author: authors.get(r.user_id) ?? null }));
}

export async function createReply(postId: string, body: string) {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const text = body.trim();
  if (!text) return { ok: false, error: "Write a reply first." };
  const { error } = await supabase
    .from("community_replies")
    .insert({ post_id: postId, user_id: user.id, body: text });
  if (error) return { ok: false, error: error.message };

  // Notify the post author (not when replying to yourself).
  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id, body")
    .eq("id", postId)
    .maybeSingle();
  const p = post as { user_id: string; body: string } | null;
  if (p && p.user_id !== user.id) {
    const { data: me } = await supabase
      .from("member_directory").select("full_name").eq("id", user.id).maybeSingle();
    await notify(p.user_id, {
      type: "reply",
      title: `${(me as { full_name: string | null } | null)?.full_name ?? "Someone"} replied to your post`,
      body: text.slice(0, 100),
      href: "/app/community",
    });
  }
  revalidatePath("/app/community");
  return { ok: true };
}

export async function deleteReply(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from("community_replies").update({ deleted: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/community");
}

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const { supabase, user } = await getUser();
  if (!user) return { liked: false };
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    return { liked: false };
  }
  await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  return { liked: true };
}

export async function reportTarget(
  targetType: "post" | "reply" | "user",
  targetId: string,
  reason?: string,
) {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false };
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason: reason ?? null,
  });
  return { ok: !error };
}
