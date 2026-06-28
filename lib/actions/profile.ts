"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Stage } from "@/lib/database.types";

export interface ProfileUpdate {
  full_name: string;
  phone: string | null;
  current_stage: Stage;
  industry: string | null;
  experience_band: string | null;
  target_salary_aed: number | null;
  target_move_date: string | null;
  has_offer: boolean;
}

export async function updateProfile(update: ProfileUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}

/** Store a small base64 avatar on the profile (resized client-side). */
export async function updateAvatar(dataUrl: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (dataUrl && (!dataUrl.startsWith("data:image/") || dataUrl.length > 300_000)) {
    return { ok: false, error: "Invalid or too-large image." };
  }
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: dataUrl })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}

/** Everything we store about the user, as a JSON string (data export). */
export async function exportMyData(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, journey, resumes, budgets, leads, bookmarks, posts] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("journey_steps").select("*").eq("user_id", user.id),
    supabase.from("resumes").select("*").eq("user_id", user.id),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase.from("leads").select("*").eq("user_id", user.id),
    supabase.from("bookmarks").select("*").eq("user_id", user.id),
    supabase.from("community_posts").select("*").eq("user_id", user.id),
  ]);

  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      journey_steps: journey.data,
      resumes: resumes.data,
      budgets: budgets.data,
      leads: leads.data,
      bookmarks: bookmarks.data,
      community_posts: posts.data,
    },
    null,
    2,
  );
}
