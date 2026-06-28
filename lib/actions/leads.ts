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

  // Fire-and-forget admin email alert. No-ops silently if RESEND_API_KEY +
  // ADMIN_ALERT_EMAIL aren't configured; the lead row is still saved either way.
  notifyAdminsOfLead(type, payload, user.email ?? null).catch(() => {});

  return { ok: true };
}

async function notifyAdminsOfLead(
  type: LeadType,
  payload: Record<string, unknown>,
  fromEmail: string | null,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.ADMIN_ALERT_EMAIL ?? process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || to.length === 0) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Dubaikar <alerts@dubaikar.com>",
      to,
      subject: `New ${type} request on Dubaikar`,
      text: [
        `Type: ${type}`,
        `From: ${fromEmail ?? "unknown"}`,
        "",
        "Payload:",
        JSON.stringify(payload, null, 2),
        "",
        "Review and respond at https://dubaikar.com/app/admin/requests",
      ].join("\n"),
    }),
  });
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
