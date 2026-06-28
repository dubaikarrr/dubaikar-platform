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
      <div className="space-y-4">
        <h1 className="text-text">Why people use Dubaikar to make the move</h1>
        <p className="max-w-2xl text-sm text-text-muted">
          The platform is free. The hands-on help is where most of our members
          save weeks of wasted effort. You skip the visa portal mistakes, find
          accommodation that is actually rentable as an Indian newcomer, and
          set up your bank, Emirates ID and Ejari in the right order.
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-[var(--radius-control)] border border-border bg-surface p-4 text-sm">
            <p className="text-2xl">⏱️</p>
            <p className="mt-2 font-medium text-text">Skip the trial and error</p>
            <p className="mt-1 text-text-muted">We have moved hundreds of Indians, so you do not retrace our wrong turns.</p>
          </li>
          <li className="rounded-[var(--radius-control)] border border-border bg-surface p-4 text-sm">
            <p className="text-2xl">📞</p>
            <p className="mt-2 font-medium text-text">A real person replies</p>
            <p className="mt-1 text-text-muted">Sanket or Shivam personally responds to every request within 48 hours.</p>
          </li>
          <li className="rounded-[var(--radius-control)] border border-border bg-surface p-4 text-sm">
            <p className="text-2xl">🇦🇪</p>
            <p className="mt-2 font-medium text-text">Dubai-specific, not generic</p>
            <p className="mt-1 text-text-muted">Visa rules, rental quirks and bank documentation tailored to your situation.</p>
          </li>
        </ul>
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
