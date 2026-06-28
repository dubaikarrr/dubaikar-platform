"use client";

import { useState, useTransition } from "react";
import { Phone } from "lucide-react";

function LinkedinGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden className={props.className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
    </svg>
  );
}
import { completeProfile } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ProfileCompleteForm({
  initialLinkedin,
  initialPhone,
}: {
  initialLinkedin: string;
  initialPhone: string;
}) {
  const [linkedin, setLinkedin] = useState(initialLinkedin);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await completeProfile({ linkedin_url: linkedin, phone });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text">Complete your profile to 100%</h1>
        <p className="mt-1 text-sm text-text-muted">
          Two more details so people in the community can find you and we can reach you about your move.
        </p>
      </div>
      {error ? (
        <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Field label="LinkedIn profile URL" htmlFor="linkedin">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">
            <LinkedinGlyph className="h-4 w-4" />
          </span>
          <Input
            id="linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/your-handle"
            className="pl-9"
          />
        </div>
      </Field>
      <Field label="Phone number" htmlFor="phone" hint="Country code included, e.g. +91 98765 43210.">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">
            <Phone className="h-4 w-4" aria-hidden />
          </span>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="pl-9"
          />
        </div>
      </Field>
      <Button onClick={submit} disabled={pending || !linkedin.trim() || !phone.trim()} block>
        {pending ? "Saving" : "Save and continue"}
      </Button>
    </div>
  );
}
