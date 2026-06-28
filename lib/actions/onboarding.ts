"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_STEPS, STAGES, type Stage } from "@/lib/journey";
import type { PrimaryReason } from "@/lib/database.types";

export interface OnboardingInput {
  full_name: string;
  primary_reason: PrimaryReason;
  education: string;
  experience_band: string;
  industry: string;
  has_offer: boolean;
  target_move_date: string | null;
  target_salary_aed: number | null;
}

/** Decide the starting stage from the onboarding answers (SPEC §8). */
function deriveStage(input: OnboardingInput): Stage {
  if (input.has_offer) return "depart"; // got the job, next is visa/flights
  return "prepare"; // most users start by getting budget + CV ready
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
      education: input.education,
      experience_band: input.experience_band,
      industry: input.industry,
      has_offer: input.has_offer,
      target_move_date: input.target_move_date,
      target_salary_aed: input.target_salary_aed,
      current_stage: stage,
      onboarded: true,
    })
    .eq("id", user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Seed the default journey steps across all stages (idempotent via unique key).
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

  redirect("/app");
}
