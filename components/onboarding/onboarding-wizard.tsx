"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";

type Reason = "employment" | "other";

const REASONS: { value: Reason; label: string }[] = [
  { value: "employment", label: "A job / employment" },
  { value: "other", label: "Other" },
];

const EDUCATION = [
  "Chartered Accountant (CA)",
  "Postgraduate (MBA / M.Com / etc.)",
  "Graduate (B.Com / B.Tech / etc.)",
  "Diploma",
  "Other",
];

const INDUSTRIES = [
  "Auditing",
  "Consulting",
  "Banking & finance",
  "Technology / IT",
  "Real estate",
  "Healthcare",
  "Sales & marketing",
  "Engineering",
  "Hospitality",
  "Education",
  "Legal",
  "Government",
  "Other",
];

// Salary bands in AED per month, in thousands.
const SALARY_BANDS = [
  { value: "4-6",   label: "AED 4k to 6k" },
  { value: "6-8",   label: "AED 6k to 8k" },
  { value: "8-12",  label: "AED 8k to 12k" },
  { value: "12-15", label: "AED 12k to 15k" },
  { value: "15+",   label: "AED 15k+" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TOTAL_STEPS = 4;
const STORAGE_KEY = "dk-onboarding-v2";

interface SavedState {
  step: number;
  fullName: string;
  reason: Reason;
  reasonOther: string;
  education: string;
  preCa: string;
  postCa: string;
  industry: string;
  hasOffer: "yes" | "no";
  moveYear: string;
  moveMonth: string;
  salaryBand: string;
}

function defaults(defaultName: string): SavedState {
  return {
    step: 1,
    fullName: defaultName,
    reason: "employment",
    reasonOther: "",
    education: "",
    preCa: "",
    postCa: "",
    industry: "",
    hasOffer: "no",
    moveYear: "",
    moveMonth: "",
    salaryBand: "",
  };
}

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const [state, setState] = useState<SavedState>(defaults(defaultName));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  const hydrated = useRef(false);

  // Restore on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedState>;
        if (saved.step && saved.step > 1) setShowResume(true);
      }
    } catch {}
    hydrated.current = true;
  }, []);

  // Save after every change
  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  function resumeSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults(defaultName), ...JSON.parse(raw) });
    } catch {}
    setShowResume(false);
  }
  function discardSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowResume(false);
  }

  function set<K extends keyof SavedState>(key: K, val: SavedState[K]) {
    setState((s) => ({ ...s, [key]: val }));
  }

  function next() {
    setError(null);
    if (state.step === 1) {
      if (!state.fullName.trim()) return setError("Please tell us your name.");
      if (state.reason === "other" && !state.reasonOther.trim())
        return setError("Briefly tell us your main reason.");
    }
    if (state.step === 2) {
      if (!state.education) return setError("Pick your highest education.");
      if (!state.industry) return setError("Pick an industry.");
    }
    setState((s) => ({ ...s, step: Math.min(TOTAL_STEPS, s.step + 1) }));
  }

  function submit() {
    setError(null);
    const monthStr =
      state.moveYear && state.moveMonth
        ? `${state.moveYear}-${String(Number(state.moveMonth)).padStart(2, "0")}-01`
        : null;

    startTransition(async () => {
      try {
        await completeOnboarding({
          full_name: state.fullName.trim(),
          primary_reason: state.reason,
          primary_reason_other: state.reason === "other" ? state.reasonOther.trim() : null,
          education: state.education,
          pre_ca_years: numOrNull(state.preCa),
          post_ca_years: numOrNull(state.postCa),
          experience_band: derivedExperience(state.preCa, state.postCa),
          industry: state.industry,
          has_offer: state.hasOffer === "yes",
          target_move_date: monthStr,
          target_salary_band: state.salaryBand || null,
          target_salary_aed: bandMidpoint(state.salaryBand),
        });
        // completeOnboarding redirects to /app/onboarding/celebrate
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {showResume ? (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-brand bg-brand-soft px-4 py-3 text-sm text-brand">
          <span>You started this earlier. Continue where you left off?</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={discardSaved}>Start over</Button>
            <Button size="sm" onClick={resumeSaved}>Continue</Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm text-text-muted">Step {state.step} of {TOTAL_STEPS}</p>
        <ProgressBar value={(state.step / TOTAL_STEPS) * 100} />
      </div>

      {error ? (
        <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {state.step === 1 && (
        <div className="space-y-4">
          <h1 className="text-text">Let&apos;s personalize your roadmap</h1>
          <Field label="Your full name" htmlFor="fullName">
            <Input id="fullName" value={state.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Priya Sharma" />
          </Field>
          <Field label="What's your main reason to move?">
            <div className="grid gap-2 sm:grid-cols-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set("reason", r.value)}
                  className={`rounded-[var(--radius-control)] border px-4 py-3 text-left text-sm transition-colors ${
                    state.reason === r.value ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-text hover:bg-surface-2"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>
          {state.reason === "other" ? (
            <Field label="Tell us what brings you to Dubai" htmlFor="reasonOther">
              <Input id="reasonOther" value={state.reasonOther} onChange={(e) => set("reasonOther", e.target.value)} placeholder="Family, study, freelancing, business setup, etc." />
            </Field>
          ) : null}
        </div>
      )}

      {state.step === 2 && (
        <div className="space-y-4">
          <h1 className="text-text">Your background</h1>
          <Field label="Highest education" htmlFor="education">
            <Select id="education" value={state.education} onChange={(e) => set("education", e.target.value)}>
              <option value="">Select</option>
              {EDUCATION.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pre-CA work experience (years)" htmlFor="preCa" hint="Articleship or any work before qualifying. 0 if none.">
              <Input id="preCa" type="number" inputMode="numeric" min="0" max="30" value={state.preCa} onChange={(e) => set("preCa", e.target.value)} placeholder="3" />
            </Field>
            <Field label="Post-CA work experience (years)" htmlFor="postCa" hint="Years after qualifying. 0 if fresher.">
              <Input id="postCa" type="number" inputMode="numeric" min="0" max="40" value={state.postCa} onChange={(e) => set("postCa", e.target.value)} placeholder="2" />
            </Field>
          </div>
          <Field label="Industry" htmlFor="industry">
            <Select id="industry" value={state.industry} onChange={(e) => set("industry", e.target.value)}>
              <option value="">Select</option>
              {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
        </div>
      )}

      {state.step === 3 && (
        <div className="space-y-4">
          <h1 className="text-text">Your move</h1>
          <Field label="Do you already have a job offer in Dubai?">
            <div className="grid grid-cols-2 gap-2">
              {(["no", "yes"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("hasOffer", v)}
                  className={`rounded-[var(--radius-control)] border px-4 py-3 text-sm capitalize transition-colors ${
                    state.hasOffer === v ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-text hover:bg-surface-2"
                  }`}
                >
                  {v === "yes" ? "Yes, I have an offer" : "Not yet"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Target month to move" hint="Pick the month you're aiming for.">
            <div className="grid grid-cols-2 gap-3">
              <Select value={state.moveMonth} onChange={(e) => set("moveMonth", e.target.value)}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </Select>
              <Select value={state.moveYear} onChange={(e) => set("moveYear", e.target.value)}>
                <option value="">Year</option>
                {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </div>
          </Field>
        </div>
      )}

      {state.step === 4 && (
        <div className="space-y-4">
          <h1 className="text-text">Target salary range</h1>
          <Field label="Pick the AED range you're aiming for" hint="A range helps us tailor jobs and the budget planner. You can change this later.">
            <div className="grid gap-2 sm:grid-cols-2">
              {SALARY_BANDS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => set("salaryBand", b.value)}
                  className={`rounded-[var(--radius-control)] border px-4 py-3 text-left text-sm transition-colors ${
                    state.salaryBand === b.value ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-text hover:bg-surface-2"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }))}
          disabled={state.step === 1 || pending}
        >
          Back
        </Button>
        {state.step < TOTAL_STEPS ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={submit} disabled={pending}>
            {pending ? "Setting up" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}

function numOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}
function derivedExperience(pre: string, post: string): string {
  const total = (numOrNull(pre) ?? 0) + (numOrNull(post) ?? 0);
  if (total === 0) return "0-1";
  if (total <= 3) return "1-3";
  if (total <= 5) return "3-5";
  if (total <= 10) return "5-10";
  return "10+";
}
function bandMidpoint(band: string): number | null {
  switch (band) {
    case "4-6":   return 5000;
    case "6-8":   return 7000;
    case "8-12":  return 10000;
    case "12-15": return 13500;
    case "15+":   return 18000;
    default:      return null;
  }
}
function yearOptions(): number[] {
  const y = new Date().getUTCFullYear();
  return [y, y + 1, y + 2, y + 3];
}
