"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pencil, GitCompareArrows, FolderOpen } from "lucide-react";
import type { Budget } from "@/lib/database.types";
import { deleteBudget, renameBudget } from "@/lib/actions/budget";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

function name(b: Budget, i: number, total: number) {
  return b.title || `Budget #${total - i}`;
}

export function BudgetHistory({ budgets }: { budgets: Budget[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [, startTransition] = useTransition();

  if (!budgets.length) return null;

  function toggleCompare(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s.slice(-1), id]));
  }

  const [a, b] = selected.map((id) => budgets.find((x) => x.id === id)).filter(Boolean) as Budget[];

  return (
    <div className="space-y-4">
      <h2 className="text-text">Saved budgets</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((bud, i) => {
          const comparing = selected.includes(bud.id);
          return (
            <Card key={bud.id} className={cn("p-4", comparing && "ring-2 ring-brand")}>
              {renaming === bud.id ? (
                <Input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setRenaming(null);
                      startTransition(() => renameBudget(bud.id, titleDraft));
                    }
                  }}
                  className="input-sm mb-1"
                />
              ) : (
                <p className="truncate text-sm font-medium text-text">{name(bud, i, budgets.length)}</p>
              )}
              <p className="text-xs text-text-subtle">
                {new Date(bud.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="mt-2 text-lg font-medium text-text tnum">{formatAED(bud.total_aed)}</p>
              <p className="text-xs text-text-subtle">≈ {formatINR(aedToInr(bud.total_aed))}</p>
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
                <Link href={`/app/budget?load=${bud.id}`} className="btn btn-ghost btn-sm" title="Load into calculator">
                  <FolderOpen className="h-4 w-4" /> Load
                </Link>
                <Button variant="ghost" size="sm" iconOnly title="Rename"
                  onClick={() => { setRenaming(bud.id); setTitleDraft(bud.title ?? ""); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" iconOnly title="Compare" className={cn(comparing && "text-brand")}
                  onClick={() => toggleCompare(bud.id)}>
                  <GitCompareArrows className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" iconOnly title="Delete" className="ml-auto text-danger"
                  onClick={() => { if (confirm("Delete this saved budget?")) startTransition(() => deleteBudget(bud.id)); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {a && b ? (
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-subtle">
                <th className="px-4 py-2 font-medium"></th>
                <th className="px-4 py-2 font-medium">{name(a, budgets.indexOf(a), budgets.length)}</th>
                <th className="px-4 py-2 font-medium">{name(b, budgets.indexOf(b), budgets.length)}</th>
                <th className="px-4 py-2 font-medium">Difference</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Total", a.total_aed, b.total_aed],
                  ["One-time", a.one_time_aed, b.one_time_aed],
                  ["Monthly", a.monthly_aed, b.monthly_aed],
                  ["Buffer", a.buffer_aed, b.buffer_aed],
                ] as [string, number, number][]
              ).map(([label, va, vb]) => {
                const diff = vb - va;
                return (
                  <tr key={label} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-text">{label}</td>
                    <td className="px-4 py-2 text-text-muted tnum">{formatAED(va)}</td>
                    <td className="px-4 py-2 text-text-muted tnum">{formatAED(vb)}</td>
                    <td className={cn("px-4 py-2 tnum", diff > 0 ? "text-danger" : diff < 0 ? "text-success" : "text-text-subtle")}>
                      {diff === 0 ? "-" : `${diff > 0 ? "+" : "−"}${formatAED(Math.abs(diff))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : selected.length === 1 ? (
        <p className="text-xs text-text-subtle">Pick one more budget to compare.</p>
      ) : null}
    </div>
  );
}
