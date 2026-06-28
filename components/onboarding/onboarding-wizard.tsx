"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { PrimaryReason } from "@/lib/database.types";

const REASONS: { value: PrimaryReason; label: string }[] = [
  { value: "employment", label: "A job / employment" },
  { value: "business", label: "Starting a business" },
  { value: "freelance", label: "Freelancing" },
  { value: "family", label: "Joining family" },
];

const EDUCATION = [
  "Chartered Accountant (CA)",
  "Postgraduate (MBA / M.Com / etc.)",
  "Graduate (B.Com / B.Tech / etc.)",
  "Diploma",
  "Other",
];

const EXPERIENCE = [
  "Fresher (0–1 yrs)",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

const INDUSTRIES = [
  "Finance & accounting",
  "Banking",
  "Technology / IT",
  "Sales & marketing",
  "Engineering",
  "Healthcare",
  "Hospitality",
  "Other",
];

const TOTAL_STEPS = 3;

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(defaultName);
  const [reason, setReason] = useState<PrimaryReason>("employment");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [hasOffer, setHasOffer] = useState<"yes" | "no">("no");
  const [moveDate, setMoveDate] = useState("");
  const [salary, setSalary] = useState("");

  function next() {
    setError(null);
    if (step === 1 && !fullName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({
          full_name: fullName.trim(),
          primary_reason: reason,
          education,
          experience_band: experience,
          industry,
          has_offer: hasOffer === "yes",
          target_move_date: moveDate || null,
          target_salary_aed: salary ? Math.round(Number(salary)) : null,
        });
        // completeOnboarding redirects on success.
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-text-muted">
          Step {step} of {TOTAL_STEPS}
        </p>
        <ProgressBar value={(step / TOTAL_STEPS) * 100} />
      </div>

      {error ? (
        <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {step === 1 && (
        <div className="space-y-4">
          <h1 className="text-text">Let&apos;s personalize your roadmap</h1>
          <Field label="Your full name" htmlFor="fullName">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Sharma"
            />
          </Field>
          <Field label="What&apos;s your main reason to move?">
            <div className="grid gap-2 sm:grid-cols-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`rounded-[var(--radius-control)] border px-4 py-3 text-left text-sm transition-colors ${
                    reason === r.value
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-text hover:bg-surface-2"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-text">Your background</h1>
          <Field label="Highest education" htmlFor="education">
            <Select
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            >
              <option value="">Select…</option>
              {EDUCATION.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Years of experience" htmlFor="experience">
            <Select
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Select…</option>
              {EXPERIENCE.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Industry" htmlFor="industry">
            <Select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Select…</option>
              {INDUSTRIES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h1 className="text-text">Your move</h1>
          <Field label="Do you already have a job offer in Dubai?">
            <div className="grid grid-cols-2 gap-2">
              {(["no", "yes"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHasOffer(v)}
                  className={`rounded-[var(--radius-control)] border px-4 py-3 text-sm capitalize transition-colors ${
                    hasOffer === v
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-text hover:bg-surface-2"
                  }`}
                >
                  {v === "yes" ? "Yes, I have an offer" : "Not yet"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Target move date" htmlFor="moveDate" hint="Approximate is fine.">
            <Input
              id="moveDate"
              type="date"
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
            />
          </Field>
          <Field
            label="Target monthly salary (AED)"
            htmlFor="salary"
            hint="Optional, helps us tailor job and budget guidance."
          >
            <Input
              id="salary"
              type="number"
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="15000"
            />
          </Field>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || pending}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={submit} disabled={pending}>
            {pending ? "Setting up…" : "Finish & see my roadmap"}
          </Button>
        )}
      </div>
    </div>
  );
}
