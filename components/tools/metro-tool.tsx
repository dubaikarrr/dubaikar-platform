"use client";

import { useMemo, useState } from "react";
import {
  METRO_STATIONS,
  calculateMetro,
  type MetroClass,
} from "@/lib/tools/metro";
import { formatAED } from "@/lib/currency";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Select, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SORTED = [...METRO_STATIONS].sort((a, b) => a.name.localeCompare(b.name));

export function MetroTool() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cls, setCls] = useState<MetroClass>("silver");
  const [days, setDays] = useState(22);

  const result = useMemo(() => {
    if (!from || !to) return null;
    return calculateMetro(Number(from), Number(to), cls, days);
  }, [from, to, cls, days]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardBody className="space-y-4">
          <Field label="From station">
            <Select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">Select boarding station…</option>
              {SORTED.map((s) => (
                <option key={s.name} value={s.zone}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="To station">
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Select destination station…</option>
              {SORTED.map((s) => (
                <option key={s.name} value={s.zone}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <Select value={cls} onChange={(e) => setCls(e.target.value as MetroClass)}>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </Select>
            </Field>
            <Field label="Commute days / month">
              <Input
                type="number"
                min={1}
                max={31}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          {result ? (
            <>
              <Badge tone="success">{result.bestLabel}</Badge>
              <Option
                label="Pay-per-ride"
                value={formatAED(result.monthlyNoPass)}
                sub={`${formatAED(result.dailyCost)}/day × ${days} days`}
                active={result.best === "ppr"}
              />
              <Option
                label="30-day pass"
                value={formatAED(result.pass30Cost)}
                sub={result.saving30 > 0 ? `Save ${formatAED(result.saving30)}/mo` : `${formatAED(Math.abs(result.saving30))} more`}
                active={result.best === "pass30"}
              />
              <Option
                label="90-day pass"
                value={`${formatAED(result.pass90Monthly)}/mo`}
                sub={result.saving90Monthly > 0 ? `Save ${formatAED(result.saving90Monthly)}/mo` : `${formatAED(Math.abs(result.saving90Monthly))} more`}
                active={result.best === "pass90"}
              />
              <p className="text-xs text-text-subtle">
                {result.zonesTravelled} zone{result.zonesTravelled > 1 ? "s" : ""} · {cls} · {formatAED(result.singleFare)} per single trip
              </p>
            </>
          ) : (
            <p className="text-sm text-text-muted">
              Pick both stations to compare pay-per-ride vs passes.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Option({
  label,
  value,
  sub,
  active,
}: {
  label: string;
  value: string;
  sub: string;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-[var(--radius-control)] border p-3",
        active ? "border-success bg-success-soft" : "border-border",
      )}
    >
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text-muted">{sub}</p>
      </div>
      <p className="font-medium text-text">{value}</p>
    </div>
  );
}
