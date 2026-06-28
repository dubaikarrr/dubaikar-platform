"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_STEPS, STAGES, type Stage } from "@/lib/journey";
import type { PrimaryReason } from "@/lib/database.types";

export interface OnboardingInput {
  full_name: string;
  primary_reason: PrimaryReason;
  primary_reason_other: string | null;
  education: string;
  pre_ca_years: number | null;
  post_ca_years: number | null;
  experience_band: string;
  industry: string;
  has_offer: boolean;
  target_move_date: string | null;
  target_salary_band: string | null;
  target_salary_aed: number | null;
}

/** Decide the starting stage from the onboarding answers (SPEC §8). */
function deriveStage(input: OnboardingInput): Stage {
  if (input.has_offer) return "depart";
  return "prepare";
}

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stage = deriveStage(input);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      primary_reason: input.primary_reason,
      primary_reason_other: input.primary_reason_other,
      education: input.education,
      pre_ca_years: input.pre_ca_years,
      post_ca_years: input.post_ca_years,
      experience_band: input.experience_band,
      industry: input.industry,
      has_offer: input.has_offer,
      target_move_date: input.target_move_date,
      target_salary_band: input.target_salary_band,
      target_salary_aed: input.target_salary_aed,
      current_stage: stage,
      onboarded: true,
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  // Seed default journey steps across all stages (idempotent via unique key).
  const rows = STAGES.flatMap((s) =>
    DEFAULT_STEPS[s].map((step) => ({
      user_id: user.id,
      stage: s,
      step_key: step.key,
      label: step.label,
    })),
  );
  await supabase
    .from("journey_steps")
    .upsert(rows, { onConflict: "user_id,step_key", ignoreDuplicates: true });

  // Celebrate, then force profile completion (LinkedIn + phone) before /app.
  redirect("/app/onboarding/celebrate?name=" + encodeURIComponent(input.full_name));
}

/** Profile-completion gate (LinkedIn + phone). Runs after the celebration screen. */
export async function completeProfile(input: { linkedin_url: string; phone: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const linkedin = input.linkedin_url.trim();
  const phone = input.phone.trim();

  if (!/^https?:\/\/(www\.)?linkedin\.com\//i.test(linkedin)) {
    throw new Error("Please enter a valid LinkedIn URL (https://linkedin.com/in/your-handle).");
  }
  if (!/^[+\d\s()-]{7,}$/.test(phone)) {
    throw new Error("Please enter a valid phone number.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ linkedin_url: linkedin, phone })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  redirect("/app");
}
