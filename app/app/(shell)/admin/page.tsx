import { requireAdmin } from "@/lib/auth/admin";
import { listAllowedEmails } from "@/lib/actions/admin-allowlist";
import { AllowlistManager } from "@/components/admin/allowlist-manager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const rows = await listAllowedEmails();
  return (
    <div className="space-y-5 p-5 md:p-6 max-w-5xl">
      <header>
        <h1 className="h1 text-text">Access control</h1>
        <p className="mt-1 text-sm text-text-muted">
          Dubaikar is invite-only. Add emails here to grant access; remove to revoke. Users sign in with Google using the email you allow.
        </p>
      </header>
      <AllowlistManager initial={rows} />
    </div>
  );
}
