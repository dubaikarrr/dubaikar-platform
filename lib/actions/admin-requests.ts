"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import type { Lead, LeadStatus } from "@/lib/database.types";

export interface RequestRow extends Lead {
  user_email: string | null;
  user_name: string | null;
}

/** Every lead, with author email/name attached. Newest first. */
export async function listAllRequests(): Promise<RequestRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: leads } = await admin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (leads as Lead[] | null) ?? [];
  if (rows.length === 0) return [];

  const ids = Array.from(
    new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v)),
  );
  const { data: profiles } = ids.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids)
    : { data: [] };
  const byId = new Map(
    ((profiles as { id: string; full_name: string | null; email: string | null }[] | null) ?? []).map(
      (p) => [p.id, p],
    ),
  );

  return rows.map((r) => ({
    ...r,
    user_email: r.user_id ? byId.get(r.user_id)?.email ?? null : null,
    user_name: r.user_id ? byId.get(r.user_id)?.full_name ?? null : null,
  }));
}

export async function updateRequestStatus(
  id: string,
  status: LeadStatus,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/admin/requests");
  return { ok: true };
}
