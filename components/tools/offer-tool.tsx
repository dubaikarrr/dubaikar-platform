"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_OFFER_INPUTS,
  evaluateOffer,
  type OfferInputs,
} from "@/lib/tools/offer";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

export function OfferTool() {
  const [inputs, setInputs] = useState<OfferInputs>(DEFAULT_OFFER_INPUTS);
  const result = useMemo(() => evaluateOffer(inputs), [inputs]);

  function num(v: string) {
    return Math.max(0, Number(v) || 0);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Basic salary (AED/mo)">
            <Input type="number" value={inputs.basicAed} onChange={(e) => setInputs({ ...inputs, basicAed: num(e.target.value) })} />
          </Field>
          <Field label="Housing allowance">
            <Input type="number" value={inputs.housingAed} onChange={(e) => setInputs({ ...inputs, housingAed: num(e.target.value) })} />
          </Field>
          <Field label="Transport allowance">
            <Input type="number" value={inputs.transportAed} onChange={(e) => setInputs({ ...inputs, transportAed: num(e.target.value) })} />
          </Field>
          <Field label="Other allowances">
            <Input type="number" value={inputs.otherAed} onChange={(e) => setInputs({ ...inputs, otherAed: num(e.target.value) })} />
          </Field>
          <Field label="Expected tenure (years)" className="sm:col-span-2">
            <Input type="number" min={1} value={inputs.years} onChange={(e) => setInputs({ ...inputs, years: Math.max(1, num(e.target.value)) })} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <p className="text-sm text-text-muted">Monthly package</p>
            <p className="text-3xl font-medium text-text">{formatAED(result.monthlyTotalAed)}</p>
            <p className="text-sm text-text-subtle">≈ {formatINR(aedToInr(result.monthlyTotalAed))}/month</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-text-muted">Annual package</p>
              <p className="font-medium text-text">{formatAED(result.annualTotalAed)}</p>
            </div>
            <div>
              <p className="text-text-muted">Gratuity after {inputs.years}y</p>
              <p className="font-medium text-text">{formatAED(result.gratuityAed)}</p>
            </div>
          </div>
          {result.issues.length > 0 ? (
            <div className="space-y-2 border-t border-border pt-4">
              {result.issues.map((i, idx) => (
                <p key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                  <Badge tone="warning" className="mt-0.5 shrink-0">Check</Badge>
                  {i}
                </p>
              ))}
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-sm text-success">
              This offer looks well-structured.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
