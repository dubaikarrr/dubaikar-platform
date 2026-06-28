"use client";

import { useMemo, useState, useTransition } from "react";
import { Check } from "lucide-react";
import {
  ARRIVAL_ITEMS,
  DEFAULT_BUDGET_INPUTS,
  FOOD,
  HOUSING,
  LIFESTYLE_ITEMS,
  TEMP_STAY,
  TRANSPORT,
  calculateBudget,
  type BudgetInputs,
  type FlightType,
  type Option,
} from "@/lib/tools/budget";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { TotalCard } from "@/components/ui/total-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { saveBudget } from "@/lib/actions/budget";
import { createLead } from "@/lib/actions/leads";

const TABS = [
  { key: "arrival", label: "Arrival" },
  { key: "housing", label: "Housing" },
  { key: "food", label: "Food" },
  { key: "transport", label: "Transport" },
  { key: "lifestyle", label: "Lifestyle" },
];

function priceLabel(aed: number, suffix?: string) {
  return (
    <span className="block text-xs text-text-subtle">
      {formatAED(aed)}
      {suffix} · ≈ {formatINR(aedToInr(aed))}
    </span>
  );
}

/** Single-select option card. */
function PickCard({
  option,
  selected,
  onSelect,
  suffix,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
  suffix?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-[var(--radius-control)] border p-3 text-left transition-colors",
        selected
          ? "border-brand bg-brand-soft"
          : "border-border bg-surface hover:bg-surface-2",
      )}
    >
      <span className="block text-sm font-medium text-text">{option.label}</span>
      {option.note ? (
        <span className="block text-xs text-text-muted">{option.note}</span>
      ) : null}
      {priceLabel(option.aed, suffix)}
    </button>
  );
}

/** Multi-select checklist row. */
function CheckCard({
  option,
  checked,
  onToggle,
  suffix,
}: {
  option: Option;
  checked: boolean;
  onToggle: () => void;
  suffix?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-control)] border p-3 text-left transition-colors",
        checked ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
          checked ? "border-brand bg-brand text-white" : "border-border",
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text">{option.label}</span>
        {option.note ? (
          <span className="block text-xs text-text-muted">{option.note}</span>
        ) : null}
      </span>
      <span className="text-xs text-text-subtle">
        {formatAED(option.aed)}
        {suffix}
      </span>
    </button>
  );
}

export function BudgetTool({
  authed = false,
  prefillRent,
  prefillArea,
  initialInputs,
  initialTitle,
}: {
  authed?: boolean;
  prefillRent?: number;
  prefillArea?: string;
  initialInputs?: BudgetInputs;
  initialTitle?: string;
}) {
  const [inputs, setInputs] = useState<BudgetInputs>(() => {
    if (initialInputs) return { ...DEFAULT_BUDGET_INPUTS, ...initialInputs };
    if (!prefillRent) return DEFAULT_BUDGET_INPUTS;
    // Pick the housing option closest to the rent passed in from the map.
    const closest = HOUSING.reduce((best, o) =>
      Math.abs(o.aed - prefillRent) < Math.abs(best.aed - prefillRent) ? o : best,
    );
    return { ...DEFAULT_BUDGET_INPUTS, housingKey: closest.key };
  });
  const [tab, setTab] = useState(prefillRent ? "housing" : "arrival");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [downloading, setDownloading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const result = useMemo(() => calculateBudget(inputs), [inputs]);

  function toggleIn(list: string[], key: string): string[] {
    return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
  }

  function onSave() {
    setStatus(null);
    startTransition(async () => {
      const r = await saveBudget(inputs, title);
      setStatus(r.ok ? "Budget saved to your account." : r.error ?? "Failed to save.");
    });
  }

  async function onDownloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch("/api/budget/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, title }),
      });
      if (!res.ok) throw new Error("pdf failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.trim() || "dubai-budget"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus("PDF download failed, try again.");
    }
    setDownloading(false);
  }

  function onHelp() {
    setStatus(null);
    startTransition(async () => {
      const r = await createLead("save_budget", { inputs, result });
      setStatus(
        r.ok
          ? "Got it, the team will reach out to help you save."
          : r.error ?? "Failed to send.",
      );
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {prefillArea ? (
          <p className="rounded-[var(--radius-control)] bg-info-soft px-3 py-2 text-sm text-info">
            Housing prefilled from <b>{prefillArea}</b> on the map
            {prefillRent ? <> ({formatAED(prefillRent)}/mo for a 1 BHK there)</> : null}.
          </p>
        ) : null}
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === "arrival" && (
          <div className="space-y-5">
            <Field label="Visit visa duration">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputs({ ...inputs, durationMonths: m })}
                    className={cn(
                      "rounded-[var(--radius-control)] border p-3 text-sm font-medium transition-colors",
                      inputs.durationMonths === m
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-surface text-text hover:bg-surface-2",
                    )}
                  >
                    {m} month{m > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Flight">
              <div className="grid grid-cols-2 gap-2">
                {(["roundtrip", "oneway"] as FlightType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInputs({ ...inputs, flightType: t })}
                    className={cn(
                      "rounded-[var(--radius-control)] border p-3 text-sm font-medium capitalize transition-colors",
                      inputs.flightType === t
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-surface text-text hover:bg-surface-2",
                    )}
                  >
                    {t === "roundtrip" ? "Round trip" : "One way"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="One-time arrival costs">
              <div className="grid gap-2 sm:grid-cols-2">
                {ARRIVAL_ITEMS.map((o) => (
                  <CheckCard
                    key={o.key}
                    option={o}
                    checked={inputs.arrival.includes(o.key)}
                    onToggle={() =>
                      setInputs({ ...inputs, arrival: toggleIn(inputs.arrival, o.key) })
                    }
                  />
                ))}
              </div>
            </Field>

            <Field label="Temporary stay while job hunting">
              <div className="grid gap-2 sm:grid-cols-3">
                {TEMP_STAY.map((o) => (
                  <PickCard
                    key={o.key}
                    option={o}
                    suffix="/night"
                    selected={inputs.tempStayKey === o.key}
                    onSelect={() => setInputs({ ...inputs, tempStayKey: o.key })}
                  />
                ))}
              </div>
              <Field label="Nights" htmlFor="nights" className="mt-3 max-w-32">
                <Input
                  id="nights"
                  type="number"
                  min={0}
                  max={30}
                  value={inputs.tempNights}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      tempNights: Math.max(0, Math.min(30, Number(e.target.value) || 0)),
                    })
                  }
                />
              </Field>
            </Field>
          </div>
        )}

        {tab === "housing" && (
          <Field label="Accommodation type" hint="Monthly rent. A ~40% deposit is added one-time.">
            <div className="grid gap-2 sm:grid-cols-2">
              {HOUSING.map((o) => (
                <PickCard
                  key={o.key}
                  option={o}
                  suffix="/mo"
                  selected={inputs.housingKey === o.key}
                  onSelect={() => setInputs({ ...inputs, housingKey: o.key })}
                />
              ))}
            </div>
          </Field>
        )}

        {tab === "food" && (
          <Field label="Food plan (monthly)">
            <div className="grid gap-2 sm:grid-cols-3">
              {FOOD.map((o) => (
                <PickCard
                  key={o.key}
                  option={o}
                  suffix="/mo"
                  selected={inputs.foodKey === o.key}
                  onSelect={() => setInputs({ ...inputs, foodKey: o.key })}
                />
              ))}
            </div>
          </Field>
        )}

        {tab === "transport" && (
          <Field label="Transport (monthly)">
            <div className="grid gap-2 sm:grid-cols-3">
              {TRANSPORT.map((o) => (
                <PickCard
                  key={o.key}
                  option={o}
                  suffix="/mo"
                  selected={inputs.transportKey === o.key}
                  onSelect={() => setInputs({ ...inputs, transportKey: o.key })}
                />
              ))}
            </div>
          </Field>
        )}

        {tab === "lifestyle" && (
          <Field label="Lifestyle add-ons (monthly)">
            <div className="grid gap-2 sm:grid-cols-2">
              {LIFESTYLE_ITEMS.map((o) => (
                <CheckCard
                  key={o.key}
                  option={o}
                  suffix="/mo"
                  checked={inputs.lifestyle.includes(o.key)}
                  onToggle={() =>
                    setInputs({ ...inputs, lifestyle: toggleIn(inputs.lifestyle, o.key) })
                  }
                />
              ))}
            </div>
          </Field>
        )}
      </div>

      {/* Sticky total */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <TotalCard
          totalAed={result.totalAed}
          oneTimeAed={result.oneTimeAed}
          monthlyAed={result.monthlyAed}
          bufferAed={result.bufferAed}
        >
          <p className="mb-3 text-xs text-text-subtle">
            For {inputs.durationMonths} month{inputs.durationMonths > 1 ? "s" : ""}, incl. 10% buffer.
          </p>
          {authed ? (
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this budget (e.g. 2-month plan)"
                className="input-sm"
              />
              <Button className="w-full" onClick={onSave} disabled={pending}>
                Save budget
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={onDownloadPdf}
                disabled={downloading}
              >
                {downloading ? "Preparing…" : "Download PDF"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={onHelp}
                disabled={pending}
              >
                Help me save
              </Button>
            </div>
          ) : (
            <ButtonLink href="/login" className="w-full">
              Sign in to save this budget
            </ButtonLink>
          )}
          {status ? (
            <p className="mt-3 text-center text-xs text-text-muted">{status}</p>
          ) : null}
        </TotalCard>
      </div>
    </div>
  );
}
