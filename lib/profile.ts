import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth/allowlist";
import type { Profile, JourneyStep } from "@/lib/database.types";

/**
 * TEMPORARY dev-only auth bypass. Set DEV_BYPASS_AUTH=1 in .env.local to let
 * the authed app render without signing in (for mobile/LAN preview). Returns a
 * stub profile; data queries by the stub id just come back empty. NEVER enable
 * in production. Remove the flag (or set to 0) to restore real auth.
 */
export const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "1";
const STUB_USER_ID = "00000000-0000-0000-0000-000000000000";

function stubProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: STUB_USER_ID,
    full_name: "Preview User",
    email: "preview@dubaikar.local",
    phone: null,
    avatar_url: null,
    current_stage: "apply",
    target_move_date: null,
    primary_reason: "employment",
    industry: "Finance",
    experience_band: "3-7",
    education: null,
    visa_status: null,
    has_offer: false,
    target_salary_aed: 15000,
    onboarded: true,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get the signed-in, allowlisted user or redirect to login. The allowlist
 * check here means removing an email revokes access on the next request.
 */
export async function requireUser() {
  const supabase = await createClient();
  if (DEV_BYPASS_AUTH) {
    return { user: { id: STUB_USER_ID, email: "preview@dubaikar.local" } as never, supabase };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isEmailAllowed(user.email))) {
    await supabase.auth.signOut();
    redirect("/login?error=not_allowed");
  }
  return { user, supabase };
}

/**
 * Load the current user's profile. Redirects to login if unauthenticated.
 * Returns null profile if the row doesn't exist yet (shouldn't happen, the
 * DB trigger creates one on signup, but we guard anyway).
 */
export async function getCurrentProfile(): Promise<{
  profile: Profile | null;
  userId: string;
}> {
  if (DEV_BYPASS_AUTH) return { profile: stubProfile(), userId: STUB_USER_ID };
  const { user, supabase } = await requireUser();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return { profile: data, userId: user.id };
}

/** Profile + completed-onboarding gate, for use inside the (app) shell. */
export async function requireOnboardedProfile(): Promise<Profile> {
  if (DEV_BYPASS_AUTH) return stubProfile();
  const { profile } = await getCurrentProfile();
  if (!profile || !profile.onboarded) redirect("/app/onboarding");
  return profile;
}

export async function getJourneySteps(userId: string): Promise<JourneyStep[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journey_steps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** Overall journey progress as a 0–100 percentage. */
export function journeyProgress(steps: JourneyStep[]): number {
  if (steps.length === 0) return 0;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / steps.length) * 100);
}
