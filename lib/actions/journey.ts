"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type Stage } from "@/lib/journey";

/** Toggle a journey step's completion for the current user. */
export async function toggleJourneyStep(stepId: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("journey_steps")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", stepId)
    .eq("user_id", user.id);

  revalidatePath("/app");
}

/** Move the user's profile to the next journey stage. */
export async function advanceStage(current: Stage) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const idx = STAGES.indexOf(current);
  const next = STAGES[idx + 1];
  if (!next) return;

  await supabase.from("profiles").update({ current_stage: next }).eq("id", user.id);
  revalidatePath("/app");
}
