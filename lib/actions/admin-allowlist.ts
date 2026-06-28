"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

export interface AllowedEmailRow {
  email: string;
  note: string | null;
  created_at: string;
  hasSignedUp: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

/** List every allowed email + whether they've signed up to Supabase Auth yet. */
export async function listAllowedEmails(): Promise<AllowedEmailRow[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("allowed_emails")
    .select("email, note, created_at")
    .order("created_at", { ascending: false });

  // Build a set of signed-up emails from auth.users (paginated).
  const signedUp = new Set<string>();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.email) signedUp.add(u.email.toLowerCase());
    }
    if (data.users.length < 1000) break;
    page++;
    if (page > 20) break; // 20k user safety cap
  }

  return (rows ?? []).map((r) => ({
    email: r.email,
    note: r.note,
    created_at: r.created_at,
    hasSignedUp: signedUp.has(r.email.toLowerCase()),
  }));
}

export async function addAllowedEmail(
  email: string,
  note?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const clean = normalize(email);
  if (!EMAIL_RE.test(clean)) return { ok: false, error: "Invalid email." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("allowed_emails")
    .upsert({ email: clean, note: note?.trim() || null }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/admin");
  return { ok: true };
}

export async function addAllowedEmailsBulk(
  input: string,
  note?: string | null,
): Promise<{ ok: boolean; added: number; skipped: number; invalid: number; error?: string }> {
  await requireAdmin();
  const tokens = input
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const valid: string[] = [];
  let invalid = 0;
  const seen = new Set<string>();
  for (const t of tokens) {
    const n = normalize(t);
    if (!EMAIL_RE.test(n)) {
      invalid++;
      continue;
    }
    if (seen.has(n)) continue;
    seen.add(n);
    valid.push(n);
  }

  if (!valid.length) return { ok: true, added: 0, skipped: 0, invalid };

  const admin = createAdminClient();
  // Find which are already present so we can report `skipped` accurately.
  const { data: existing } = await admin
    .from("allowed_emails")
    .select("email")
    .in("email", valid);
  const existingSet = new Set((existing ?? []).map((r) => r.email));

  const rows = valid.map((email) => ({ email, note: note?.trim() || null }));
  const { error } = await admin
    .from("allowed_emails")
    .upsert(rows, { onConflict: "email" });
  if (error) return { ok: false, added: 0, skipped: 0, invalid, error: error.message };

  const added = valid.filter((e) => !existingSet.has(e)).length;
  const skipped = valid.length - added;
  revalidatePath("/app/admin");
  return { ok: true, added, skipped, invalid };
}

export async function removeAllowedEmail(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const clean = normalize(email);
  const admin = createAdminClient();
  const { error } = await admin.from("allowed_emails").delete().eq("email", clean);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/admin");
  return { ok: true };
}
