"use client";

import { useState } from "react";
import { Briefcase, FileText, Plus, Wallet } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StageStrip } from "@/components/ui/stage-strip";
import { TaskRow } from "@/components/ui/task-row";
import { TotalCard } from "@/components/ui/total-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-border pb-2 text-text">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const [tab, setTab] = useState("arrival");

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-text">Dubaikar design system</h1>
          <p className="text-sm text-text-muted">
            Every primitive from SPEC §7, in both color modes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="#">Link button</ButtonLink>
        </div>
      </Section>

      <Section title="Badges / pills">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="success">Offer</Badge>
          <Badge tone="info">Interview</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Rejected</Badge>
        </div>
      </Section>

      <Section title="Cards & metrics">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="CV score"
            value="82"
            hint="+6 since last scan"
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            label="Applications"
            value="7"
            hint="2 in interview"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <MetricCard
            label="Budget saved"
            value="AED 38k"
            icon={<Wallet className="h-5 w-5" />}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>A short supporting description.</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-text-muted">Card body content.</p>
          </CardBody>
        </Card>
      </Section>

      <Section title="Stage strip">
        <Card className="p-5">
          <StageStrip current="apply" showTaglines />
        </Card>
      </Section>

      <Section title="Progress">
        <div className="space-y-3">
          <ProgressBar value={35} />
          <ProgressBar value={70} />
        </div>
      </Section>

      <Section title="Task rows">
        <div className="space-y-2">
          <TaskRow
            title="Get your CV ATS-scored"
            description="Aim for 80+ before you apply"
            href="#"
            icon={<FileText className="h-4 w-4" />}
          />
          <TaskRow
            title="Estimate your move-in budget"
            href="#"
            icon={<Wallet className="h-4 w-4" />}
          />
          <TaskRow title="Clarify your reason to move" done />
        </div>
      </Section>

      <Section title="Segmented tabs">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "arrival", label: "Arrival" },
            { key: "housing", label: "Housing" },
            { key: "food", label: "Food" },
            { key: "transport", label: "Transport" },
            { key: "lifestyle", label: "Lifestyle" },
          ]}
        />
      </Section>

      <Section title="Total card">
        <div className="max-w-xs">
          <TotalCard
            totalAed={42500}
            oneTimeAed={18000}
            monthlyAed={6500}
            bufferAed={12000}
          />
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-md gap-4">
          <Field label="Full name" htmlFor="sg-name">
            <Input id="sg-name" placeholder="Priya Sharma" />
          </Field>
          <Field label="Industry" htmlFor="sg-industry">
            <Select id="sg-industry" defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option>Finance &amp; accounting</option>
              <option>Technology</option>
            </Select>
          </Field>
          <Field label="Summary" hint="2–3 lines.">
            <Textarea placeholder="Short professional summary" />
          </Field>
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar name="Priya Sharma" />
          <Avatar name="Rahul" size={48} />
          <Avatar />
        </div>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title="No applications yet"
          description="Save a job to start tracking your applications."
          action={<Button size="sm">Browse jobs</Button>}
        />
      </Section>

      <Section title="Skeletons">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Section>
    </div>
  );
}
