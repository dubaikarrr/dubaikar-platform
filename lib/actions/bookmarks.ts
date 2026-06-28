"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Bookmark } from "@/lib/database.types";

export async function listBookmarks(kind?: "area" | "guide"): Promise<Bookmark[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase.from("bookmarks").select("*").eq("user_id", user.id);
  if (kind) q = q.eq("kind", kind);
  const { data } = await q.order("created_at", { ascending: false });
  return (data as Bookmark[] | null) ?? [];
}

/** Toggle a bookmark; returns the new state. */
export async function toggleBookmark(
  kind: "area" | "guide",
  refKey: string,
): Promise<{ bookmarked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookmarked: false };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("ref_key", refKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", (existing as { id: string }).id);
    revalidatePath("/app");
    return { bookmarked: false };
  }
  await supabase.from("bookmarks").insert({ user_id: user.id, kind, ref_key: refKey });
  revalidatePath("/app");
  return { bookmarked: true };
}
