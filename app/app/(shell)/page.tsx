import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText, Wallet, Calculator, ArrowRight, MessageCircle, CalendarCheck,
  MapPinned, ScanLine, Users, Star, CalendarDays,
} from "lucide-react";
import { requireOnboardedProfile, getJourneySteps, journeyProgress } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getFeed } from "@/lib/actions/community";
import { listBookmarks } from "@/lib/actions/bookmarks";
import { AREAS } from "@/lib/map/areas";
import { STAGE_META } from "@/lib/journey";
import { formatAED } from "@/lib/currency";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { StageStrip } from "@/components/ui/stage-strip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TaskRow } from "@/components/ui/task-row";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { JourneyChecklist } from "@/components/dashboard/journey-checklist";

export const metadata: Metadata = { title: "Dashboard" };

const TOOLS = [
  { href: "/app/resume", label: "Resume builder", desc: "Build & ATS-score your CV", icon: FileText },
  { href: "/app/budget", label: "Budget calculator", desc: "Plan your move-in costs", icon: Wallet },
  { href: "/app/map", label: "Explore Dubai", desc: "Areas, rents & metro", icon: MapPinned },
];

interface SmartStep {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default async function DashboardPage() {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();

  const [steps, bookmarks, posts, { data: resumes }, { count: budgetCount }] = await Promise.all([
    getJourneySteps(profile.id),
    listBookmarks("area"),
    getFeed(),
    supabase
      .from("resumes")
      .select("id, ats_score, title, updated_at")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false }),
    supabase.from("budgets").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const progress = journeyProgress(steps);
  const resumeList = (resumes as { id: string; ats_score: number | null; title: string; updated_at: string }[] | null) ?? [];
  const latestResume = resumeList[0];
  const shortlisted = bookmarks
    .map((b) => AREAS.find((a) => a.slug === b.ref_key))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // ---- Smart next steps (data-driven) ----
  const smart: SmartStep[] = [];
  if (!resumeList.length) {
    smart.push({ title: "Create your first resume", description: "12 Dubai-ready templates, free PDF", href: "/app/resume", icon: <FileText className="h-4 w-4" /> });
  } else if (latestResume.ats_score == null) {
    smart.push({ title: "Scan your CV for ATS", description: `"${latestResume.title}" hasn't been scored yet`, href: `/app/resume/${latestResume.id}`, icon: <ScanLine className="h-4 w-4" /> });
  } else if (latestResume.ats_score < 70) {
    smart.push({ title: `Improve your ATS score (${latestResume.ats_score}/100)`, description: "Aim for 70+ before applying", href: `/app/resume/${latestResume.id}`, icon: <ScanLine className="h-4 w-4" /> });
  }
  if (!budgetCount) {
    smart.push({ title: "Estimate your move-in budget", description: "Know your number in AED and ₹", href: "/app/budget", icon: <Wallet className="h-4 w-4" /> });
  }
  if (!shortlisted.length) {
    smart.push({ title: "Shortlist areas to live", description: "Explore the Dubai map and star 2–3 areas", href: "/app/map", icon: <MapPinned className="h-4 w-4" /> });
  }
  for (const s of steps.filter((s) => !s.completed && s.stage === profile.current_stage)) {
    if (smart.length >= 4) break;
    smart.push({ title: s.label, description: STAGE_META[s.stage].label, href: "/app", icon: <CalendarCheck className="h-4 w-4" /> });
  }

  // ---- Move countdown ----
  let countdown: { days: number; past: boolean } | null = null;
  if (profile.target_move_date) {
    const diff = Math.ceil((new Date(profile.target_move_date).getTime() - Date.now()) / 86400000);
    countdown = { days: Math.abs(diff), past: diff < 0 };
  }

  const firstName = profile.full_name?.split(" ")[0] ?? "there";
  const topmate = process.env.NEXT_PUBLIC_TOPMATE_URL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  return (
    <div className="space-y-6">
      {/* Greeting + countdown */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-text">Hi {firstName} 👋</h1>
          <p className="text-sm text-text-muted">
            You&apos;re in the{" "}
            <span className="font-medium text-brand">{STAGE_META[profile.current_stage].label}</span>{" "}
            stage, {STAGE_META[profile.current_stage].tagline.toLowerCase()}.
          </p>
        </div>
        {countdown ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-2.5">
            <CalendarDays className="h-5 w-5 text-brand" />
            <div>
              <p className="text-lg font-medium leading-tight text-text tnum">{countdown.days} days</p>
              <p className="text-[11px] text-text-subtle">{countdown.past ? "past your target date" : "to your target move date"}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Journey strip */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-text">Your journey</h2>
          <span className="text-sm text-text-muted">{progress}% complete</span>
        </div>
        <StageStrip current={profile.current_stage} showTaglines />
        <ProgressBar value={progress} className="mt-5" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Smart next steps */}
          <Card>
            <CardHeader><CardTitle>Your next steps</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {smart.length ? (
                smart.map((s) => (
                  <TaskRow key={s.title} title={s.title} description={s.description} href={s.href} icon={s.icon} />
                ))
              ) : (
                <p className="text-sm text-text-muted">You&apos;re all caught up, nice work. 🎉</p>
              )}
            </CardBody>
          </Card>

          {/* Full journey checklist */}
          <div>
            <h2 className="mb-3 text-text">Journey checklist</h2>
            <JourneyChecklist steps={steps} currentStage={profile.current_stage} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Resumes" value={resumeList.length} hint={latestResume?.ats_score != null ? `Best ATS ${Math.max(...resumeList.map((r) => r.ats_score ?? 0))}` : "Not scored yet"} icon={<FileText className="h-5 w-5" />} />
            <MetricCard label="Target salary" value={profile.target_salary_aed ? formatAED(profile.target_salary_aed) : "-"} hint="per month" icon={<Calculator className="h-5 w-5" />} />
          </div>

          {/* Shortlisted areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-warning" /> Shortlisted areas</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {shortlisted.length ? (
                shortlisted.slice(0, 4).map((a) => (
                  <Link key={a.slug} href="/app/map" className="flex items-center justify-between rounded-[var(--radius-control)] border border-border p-2.5 text-sm hover:bg-surface-2">
                    <span className="font-medium text-text">{a.name}</span>
                    <span className="text-xs text-text-subtle">1BHK {formatAED(a.rent.oneBhk)}/mo</span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-text-muted">
                  No areas saved yet, <Link href="/app/map" className="text-brand hover:underline">explore the map</Link> and star a few.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Community widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-brand" /> Community</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {posts.length ? (
                posts.slice(0, 3).map((p) => (
                  <Link key={p.id} href="/app/community" className="flex items-start gap-2.5 rounded-[var(--radius-control)] p-1.5 hover:bg-surface-2">
                    <Avatar name={p.author?.full_name} src={p.author?.avatar_url} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-text">{p.author?.full_name ?? "Member"}</span>
                      <span className="line-clamp-2 text-xs text-text-muted">{p.body}</span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-text-muted">No posts yet, start the first conversation.</p>
              )}
              <ButtonLink href="/app/community" variant="secondary" size="sm" block>
                Open community <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Quick tools */}
      <div>
        <h2 className="mb-3 text-text">Quick tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.label} href={t.href} className="hovcard card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-medium text-text">{t.label}</p>
                <p className="text-sm text-text-muted">{t.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Session / community banner */}
      <Card className="overflow-hidden border-brand/30 bg-brand-soft p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-text">Talk to a Dubai expert</h2>
            <p className="text-sm text-text-muted">Book a 1:1 session with CAs Sanket &amp; Shivam, or join the free community.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topmate ? (
              <ButtonLink href={topmate} target="_blank" rel="noopener">
                <CalendarCheck className="h-4 w-4" /> Book a session
              </ButtonLink>
            ) : null}
            {whatsapp ? (
              <ButtonLink href={whatsapp} target="_blank" rel="noopener" variant="secondary">
                <MessageCircle className="h-4 w-4" /> Join community
              </ButtonLink>
            ) : (
              <ButtonLink href="/app/community" variant="secondary">
                <MessageCircle className="h-4 w-4" /> Community feed
              </ButtonLink>
            )}
            {!topmate ? <Badge tone="info">Add NEXT_PUBLIC_TOPMATE_URL to enable booking</Badge> : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
