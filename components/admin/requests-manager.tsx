"use client";

import { useMemo, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import type { LeadStatus } from "@/lib/database.types";
import {
  updateRequestStatus,
  type RequestRow,
} from "@/lib/actions/admin-requests";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";

const TYPE_LABEL: Record<string, string> = {
  visa: "Visa assistance",
  accommodation: "Accommodation help",
  save_budget: "Help me save (budget)",
  setup: "Company setup",
  session: "1:1 session",
};

function categoryFor(row: RequestRow): { key: string; label: string } {
  const action = (row.payload as { action?: string })?.action;
  if (row.type === "setup" && action === "delete") {
    return { key: "deletion", label: "Account deletion" };
  }
  return { key: row.type, label: TYPE_LABEL[row.type] ?? row.type };
}

const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: "info",
  contacted: "warning",
  closed: "success",
};
const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "In progress",
  closed: "Closed",
};

export function RequestsManager({ initial }: { initial: RequestRow[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: RequestRow[] }>();
    for (const r of rows) {
      if (filter !== "all" && r.status !== filter) continue;
      if (query) {
        const q = query.toLowerCase();
        const blob = `${r.user_email ?? ""} ${r.user_name ?? ""} ${JSON.stringify(r.payload)}`.toLowerCase();
        if (!blob.includes(q)) continue;
      }
      const cat = categoryFor(r);
      const slot = map.get(cat.key) ?? { label: cat.label, items: [] };
      slot.items.push(r);
      map.set(cat.key, slot);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  }, [rows, filter, query]);

  function setStatus(id: string, status: LeadStatus) {
    startTransition(async () => {
      const r = await updateRequestStatus(id, status);
      if (!r.ok) {
        setToast(r.error ?? "Failed to update.");
        return;
      }
      setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      setToast(`Marked as ${STATUS_LABEL[status]}`);
      setTimeout(() => setToast(null), 3000);
    });
  }

  const counts = useMemo(() => {
    let nNew = 0, nC = 0, nCl = 0;
    for (const r of rows) {
      if (r.status === "new") nNew++;
      else if (r.status === "contacted") nC++;
      else if (r.status === "closed") nCl++;
    }
    return { all: rows.length, new: nNew, contacted: nC, closed: nCl };
  }, [rows]);

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "new", "contacted", "closed"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "primary" : "ghost"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : STATUS_LABEL[f]}{" "}
                <span className="opacity-70">({counts[f]})</span>
              </Button>
            ))}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, name, payload"
            className="w-[min(20rem,calc(100vw-3rem))]"
          />
        </CardBody>
      </Card>

      {toast ? <p className="text-sm text-text-muted">{toast}</p> : null}

      {groups.length === 0 ? (
        <EmptyState title="No requests" description="When users submit requests they'll show up here, grouped by service." />
      ) : (
        groups.map((g) => (
          <Card key={g.key}>
            <CardHeader>
              <CardTitle>{g.label}</CardTitle>
              <CardDescription>{g.items.length} request{g.items.length === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-text-subtle">
                    <tr>
                      <th className="px-5 py-3 font-medium">From</th>
                      <th className="px-5 py-3 font-medium">Details</th>
                      <th className="px-5 py-3 font-medium">Sent</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 align-top">
                        <td className="px-5 py-3">
                          <div className="font-medium text-text">{r.user_name ?? "Member"}</div>
                          {r.user_email ? (
                            <a href={`mailto:${r.user_email}`} className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                              <Mail className="h-3 w-3" /> {r.user_email}
                            </a>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 max-w-md text-text-muted">
                          <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(r.payload, null, 0)}</pre>
                        </td>
                        <td className="px-5 py-3 text-text-muted whitespace-nowrap">{formatDate(r.created_at)}</td>
                        <td className="px-5 py-3"><Badge tone={STATUS_TONE[r.status]} dot>{STATUS_LABEL[r.status]}</Badge></td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex flex-wrap justify-end gap-1.5">
                            {r.status !== "contacted" ? (
                              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus(r.id, "contacted")}>In progress</Button>
                            ) : null}
                            {r.status !== "closed" ? (
                              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus(r.id, "closed")}>Close</Button>
                            ) : null}
                            {r.status !== "new" ? (
                              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus(r.id, "new")}>Reopen</Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
