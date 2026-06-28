import { requireAdmin } from "@/lib/auth/admin";
import { listAllRequests } from "@/lib/actions/admin-requests";
import { RequestsManager } from "@/components/admin/requests-manager";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  await requireAdmin();
  const rows = await listAllRequests();
  return (
    <div className="space-y-5 p-5 md:p-6 max-w-6xl">
      <header>
        <h1 className="h1 text-text">Requests</h1>
        <p className="mt-1 text-sm text-text-muted">
          Every service request from the platform, grouped by type. Mark as in
          progress when you start working on it, and closed when done.
        </p>
      </header>
      <RequestsManager initial={rows} />
    </div>
  );
}
