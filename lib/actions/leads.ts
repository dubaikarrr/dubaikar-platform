"use server";

import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadType } from "@/lib/database.types";

export interface CreateLeadResult {
  ok: boolean;
  error?: string;
}

/**
 * Create a lead routed to the team. Works for authed users (RLS-checked).
 * Public/anonymous capture (user_id null) would go through a service-role
 * route handler, added when public tools need it.
 */
export async function createLead(
  type: LeadType,
  payload: Record<string, unknown>,
): Promise<CreateLeadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("leads").insert({
    user_id: user.id,
    type,
    payload,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** The current user's service requests, newest first. */
export async function listMyLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as Lead[] | null) ?? [];
}
