"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { createLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

export function HousingHelpForm({ shortlist }: { shortlist: string[] }) {
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createLead("accommodation", {
        budget_aed: budget ? Number(budget) : null,
        areas: shortlist,
        note,
      });
      if (r.ok) setDone(true);
      else setError(r.error ?? "Failed to send.");
    });
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-success">
        <Check className="h-4 w-4" /> Request sent, the team will reach out with verified options.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Field label="Monthly budget (AED)" htmlFor="hb">
        <Input id="hb" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 3000" />
      </Field>
      <Field label="What are you looking for?" htmlFor="hn" hint={shortlist.length ? `We'll include your shortlisted areas: ${shortlist.join(", ")}` : undefined}>
        <Textarea id="hn" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bed space / studio / 1BHK, move-in date, any preferences…" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button onClick={submit} disabled={pending}>Request accommodation help</Button>
    </div>
  );
}
