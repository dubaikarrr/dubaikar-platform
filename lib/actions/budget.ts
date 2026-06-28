"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateBudget, type BudgetInputs } from "@/lib/tools/budget";
import type { Budget } from "@/lib/database.types";

export interface SaveBudgetResult {
  ok: boolean;
  error?: string;
}

/** Persist a budget run for the current user, and mark the plan_budget step. */
export async function saveBudget(
  inputs: BudgetInputs,
  title?: string,
): Promise<SaveBudgetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const result = calculateBudget(inputs);

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    title: title?.trim() || null,
    inputs: inputs as unknown as Record<string, unknown>,
    total_aed: result.totalAed,
    one_time_aed: result.oneTimeAed,
    monthly_aed: result.monthlyAed,
    buffer_aed: result.bufferAed,
  });
  if (error) return { ok: false, error: error.message };

  // Mark the budget journey step complete.
  await supabase
    .from("journey_steps")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("step_key", "plan_budget");

  revalidatePath("/app");
  revalidatePath("/app/budget");
  return { ok: true };
}

export async function listBudgets(): Promise<Budget[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as Budget[] | null) ?? [];
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/budget");
}

export async function renameBudget(id: string, title: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("budgets")
    .update({ title: title.trim() || null })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/app/budget");
}

export async function getBudget(id: string): Promise<Budget | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as Budget | null) ?? null;
}
