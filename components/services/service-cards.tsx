"use client";

import { useState, useTransition } from "react";
import { Home, Plane, Building2, CalendarCheck, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { createLead } from "@/lib/actions/leads";
import type { LeadType } from "@/lib/database.types";

const SERVICES: {
  type: LeadType;
  title: string;
  desc: string;
  icon: typeof Home;
  steps: string[];
}[] = [
  {
    type: "visa", title: "Visa assistance", desc: "Employment, freelance, or investor visa guidance.", icon: Plane,
    steps: ["We review your situation within 24–48h", "A 15-min call to map your visa route", "Fixed quote before any work starts"],
  },
  {
    type: "accommodation", title: "Find accommodation", desc: "We help you find a verified place to stay.", icon: Home,
    steps: ["Tell us area, budget & move-in date", "We shortlist verified options", "You only pay once you pick a place"],
  },
  {
    type: "setup", title: "Company setup", desc: "Free-zone vs mainland, costs, and registration.", icon: Building2,
    steps: ["Free-zone vs mainland recommendation", "Itemised cost estimate for your activity", "We handle licensing end-to-end"],
  },
  {
    type: "session", title: "1:1 expert session", desc: "Talk through your move with a CA.", icon: CalendarCheck,
    steps: ["Pick a slot that suits you", "45-min video call with Sanket or Shivam", "Written action plan after the call"],
  },
];

function ServiceCard({
  type,
  title,
  desc,
  Icon,
  steps,
}: {
  type: LeadType;
  title: string;
  desc: string;
  Icon: typeof Home;
  steps: string[];
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createLead(type, { note });
      if (r.ok) setDone(true);
      else setError(r.error ?? "Failed to send.");
    });
  }

  return (
    <Card className="p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-text">{title}</h3>
      <p className="text-sm text-text-muted">{desc}</p>

      <ol className="mt-3 space-y-1">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
            <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {done ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-success">
          <Check className="h-4 w-4" /> Request sent, we&apos;ll be in touch.
        </p>
      ) : open ? (
        <div className="mt-4 space-y-3">
          <Field label="Anything we should know? (optional)">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Your timeline, budget, questions…"
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending} size="sm">
              Send request
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => setOpen(true)}
        >
          Request help
        </Button>
      )}
    </Card>
  );
}

export function ServiceCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SERVICES.map((s) => (
        <ServiceCard
          key={s.type}
          type={s.type}
          title={s.title}
          desc={s.desc}
          Icon={s.icon}
          steps={s.steps}
        />
      ))}
    </div>
  );
}
