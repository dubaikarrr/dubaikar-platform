import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Invite-only gate. An email may use the app only if it's in `allowed_emails`.
 * Read with the service-role client (the table is RLS-locked from the browser).
 */
export async function isEmailAllowed(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("allowed_emails")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}
