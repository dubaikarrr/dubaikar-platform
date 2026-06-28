"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Trash2, UserPlus, Users, Search } from "lucide-react";
import {
  addAllowedEmail,
  addAllowedEmailsBulk,
  removeAllowedEmail,
  type AllowedEmailRow,
} from "@/lib/actions/admin-allowlist";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

type Toast = { kind: "success" | "error"; msg: string } | null;

export function AllowlistManager({ initial }: { initial: AllowedEmailRow[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState<"one" | "bulk">("one");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [pending, startTransition] = useTransition();

  // Add-one form
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // Bulk form
  const [bulk, setBulk] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  // Confirm-delete state
  const [confirming, setConfirming] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = rows.length;
    const signed = rows.filter((r) => r.hasSignedUp).length;
    return { total, signed, pending: total - signed };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.note ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  function flash(t: Toast) {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 4000);
  }

  function refresh(next: AllowedEmailRow[]) {
    setRows(next);
  }

  function submitOne() {
    if (!email.trim()) return;
    startTransition(async () => {
      const r = await addAllowedEmail(email, note);
      if (!r.ok) return flash({ kind: "error", msg: r.error ?? "Failed to add." });
      // Optimistic insert; created_at exact time from server arrives on next nav.
      const clean = email.trim().toLowerCase();
      const exists = rows.some((x) => x.email === clean);
      if (!exists) {
        refresh([
          {
            email: clean,
            note: note.trim() || null,
            created_at: new Date().toISOString(),
            hasSignedUp: false,
          },
          ...rows,
        ]);
      }
      setEmail("");
      setNote("");
      flash({ kind: "success", msg: `Added ${clean}` });
    });
  }

  function submitBulk() {
    if (!bulk.trim()) return;
    startTransition(async () => {
      const r = await addAllowedEmailsBulk(bulk, bulkNote);
      if (!r.ok) return flash({ kind: "error", msg: r.error ?? "Failed to add." });
      setBulk("");
      setBulkNote("");
      flash({
        kind: "success",
        msg: `Added ${r.added}, skipped ${r.skipped} duplicate${r.skipped === 1 ? "" : "s"}${
          r.invalid ? `, ${r.invalid} invalid` : ""
        }. Reload to see them.`,
      });
    });
  }

  function doRemove(targetEmail: string) {
    startTransition(async () => {
      const r = await removeAllowedEmail(targetEmail);
      if (!r.ok) return flash({ kind: "error", msg: r.error ?? "Failed to remove." });
      refresh(rows.filter((x) => x.email !== targetEmail));
      setConfirming(null);
      flash({ kind: "success", msg: `Removed ${targetEmail}` });
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Total allowed" value={String(stats.total)} icon={<Users className="h-5 w-5" />} />
        <MetricCard label="Signed up" value={String(stats.signed)} icon={<Check className="h-5 w-5" />} />
        <MetricCard label="Pending first sign-in" value={String(stats.pending)} icon={<UserPlus className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grant access</CardTitle>
          <CardDescription>
            Add an email to the allowlist. That person can sign in with Google using the same email and reach the app.
          </CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <SegmentedTabs
            value={tab}
            onChange={(v) => setTab(v as "one" | "bulk")}
            tabs={[
              { key: "one", label: "Add one" },
              { key: "bulk", label: "Bulk add" },
            ]}
          />

          {tab === "one" ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Email" htmlFor="adm-email">
                <Input
                  id="adm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitOne();
                  }}
                />
              </Field>
              <Field label="Note (optional)" htmlFor="adm-note">
                <Input
                  id="adm-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Jun cohort, friend of Sanket"
                />
              </Field>
              <Button onClick={submitOne} disabled={pending || !email.trim()}>
                Add
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Field
                label="Emails"
                htmlFor="adm-bulk"
                hint="Paste any mix of commas, spaces or new lines. Invalid entries are skipped."
              >
                <Textarea
                  id="adm-bulk"
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                  rows={5}
                  placeholder={"a@example.com\nb@example.com, c@example.com"}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field label="Shared note (optional)" htmlFor="adm-bulk-note">
                  <Input
                    id="adm-bulk-note"
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    placeholder="e.g. June 2026 webinar"
                  />
                </Field>
                <Button onClick={submitBulk} disabled={pending || !bulk.trim()}>
                  Add all
                </Button>
              </div>
            </div>
          )}

          {toast ? (
            <p
              className={
                toast.kind === "success" ? "text-sm text-success" : "text-sm text-danger"
              }
            >
              {toast.msg}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Allowed emails</CardTitle>
              <CardDescription>
                Anyone here can sign in. Remove them to revoke access on their next request.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email or note"
                className="pl-9 w-[min(20rem,calc(100vw-3rem))]"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={rows.length === 0 ? "No allowed emails yet" : "No matches"}
                description={
                  rows.length === 0
                    ? "Add your first email above to grant someone access."
                    : "Try a different search."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-text-subtle">
                  <tr>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Note</th>
                    <th className="px-5 py-3 font-medium">Added</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.email} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium text-text break-all">{r.email}</td>
                      <td className="px-5 py-3 text-text-muted">{r.note ?? "—"}</td>
                      <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        {r.hasSignedUp ? (
                          <Badge tone="success" dot>signed up</Badge>
                        ) : (
                          <Badge tone="warning" dot>pending</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {confirming === r.email ? (
                          <span className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => doRemove(r.email)}
                              disabled={pending}
                            >
                              Confirm remove
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirming(null)}
                              disabled={pending}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirming(r.email)}
                            aria-label={`Remove ${r.email}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1.5">Remove</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
