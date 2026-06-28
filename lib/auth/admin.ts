import { redirect } from "next/navigation";
import { requireUser, DEV_BYPASS_AUTH } from "@/lib/profile";

/**
 * Founders/admins are identified by the comma-separated ADMIN_EMAILS env var.
 * Server-only — never reference this list in the browser bundle.
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  // If ADMIN_EMAILS is set, ALWAYS honour it (even under DEV_BYPASS_AUTH) —
  // founders rely on this to lock the admin page to specific accounts.
  if (admins.length > 0) {
    return admins.includes(email.toLowerCase().trim());
  }
  // No ADMIN_EMAILS configured: only the dev bypass stub user is treated as
  // admin (solo-developer convenience). In production this means "nobody".
  return DEV_BYPASS_AUTH;
}

/**
 * Gate for the admin dashboard. Bounces non-admins back to /app.
 * Returns the authed user so the caller can use their email/id.
 */
export async function requireAdmin() {
  const { user, supabase } = await requireUser();
  if (!isAdminEmail(user.email)) redirect("/app");
  return { user, supabase };
}
