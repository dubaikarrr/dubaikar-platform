"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { STAGES, STAGE_META } from "@/lib/journey";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Card, CardBody } from "@/components/ui/card";
import type { Profile, Stage } from "@/lib/database.types";

export function SettingsForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [stage, setStage] = useState<Stage>(profile.current_stage);
  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [experience, setExperience] = useState(profile.experience_band ?? "");
  const [salary, setSalary] = useState(
    profile.target_salary_aed ? String(profile.target_salary_aed) : "",
  );
  const [moveDate, setMoveDate] = useState(profile.target_move_date ?? "");
  const [hasOffer, setHasOffer] = useState(profile.has_offer);

  function save() {
    setStatus(null);
    startTransition(async () => {
      const r = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        current_stage: stage,
        industry: industry || null,
        experience_band: experience || null,
        target_salary_aed: salary ? Math.round(Number(salary)) : null,
        target_move_date: moveDate || null,
        has_offer: hasOffer,
      });
      setStatus(r.ok ? "Saved." : r.error ?? "Failed to save.");
    });
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="s-name">
            <Input id="s-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="s-email">
            <Input id="s-email" value={profile.email ?? ""} disabled />
          </Field>
          <Field label="Phone" htmlFor="s-phone">
            <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
          </Field>
          <Field label="Current stage" htmlFor="s-stage">
            <Select
              id="s-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_META[s].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Industry" htmlFor="s-industry">
            <Input id="s-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </Field>
          <Field label="Experience" htmlFor="s-exp">
            <Input id="s-exp" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </Field>
          <Field label="Target salary (AED/mo)" htmlFor="s-salary">
            <Input
              id="s-salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </Field>
          <Field label="Target move date" htmlFor="s-date">
            <Input
              id="s-date"
              type="date"
              value={moveDate ?? ""}
              onChange={(e) => setMoveDate(e.target.value)}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={hasOffer}
            onChange={(e) => setHasOffer(e.target.checked)}
          />
          I already have a job offer in Dubai
        </label>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          {status ? <span className="text-sm text-text-muted">{status}</span> : null}
        </div>
      </CardBody>
    </Card>
  );
}
