import type { Metadata } from "next";
import { ServiceCards } from "@/components/services/service-cards";
import { listMyLeads } from "@/lib/actions/leads";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Services" };

const TYPE_LABELS: Record<string, string> = {
  visa: "Visa assistance",
  accommodation: "Accommodation help",
  save_budget: "Help me save (budget)",
  setup: "Company setup",
  session: "1:1 session",
};
const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  new: { label: "Received", tone: "info" },
  contacted: { label: "In progress", tone: "warning" },
  closed: { label: "Closed", tone: "success" },
};

export default async function ServicesPage() {
  const leads = await listMyLeads();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-text">Services</h1>
        <p className="text-sm text-text-muted">
          Hands-on help from the Dubaikar team. Send a request and we&apos;ll
          reach out, the tools stay free.
        </p>
      </div>
      <ServiceCards />

      {leads.length ? (
        <div>
          <h2 className="mb-3 text-text">My requests</h2>
          <div className="space-y-2">
            {leads.map((l) => {
              const s = STATUS[l.status] ?? STATUS.new;
              const note = (l.payload as { note?: string })?.note;
              return (
                <Card key={l.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text">{TYPE_LABELS[l.type] ?? l.type}</p>
                    <p className="truncate text-xs text-text-subtle">
                      {new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {note ? ` · "${note}"` : ""}
                    </p>
                  </div>
                  <Badge tone={s.tone} dot>{s.label}</Badge>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
