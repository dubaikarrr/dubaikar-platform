import { CalendarDays, Clock, Users, AlertCircle, Check } from "lucide-react";
import { WEBINAR, WEBINAR_DISCLAIMER } from "@/lib/webinar";
import { FeatureShowcase } from "@/components/webinar/feature-showcase";
import { WebinarRegister } from "@/components/webinar/webinar-register";
import { Countdown } from "@/components/webinar/countdown";

export default function WebinarPage() {
  return (
    <>
      {/* Honest disclaimer, the very first thing visitors see. */}
      <div className="border-b border-warning/30 bg-warning-soft">
        <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-3 text-sm text-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>{WEBINAR_DISCLAIMER}</p>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
              <Users className="h-3.5 w-3.5" /> Live webinar · {WEBINAR.hostLabel}
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-text sm:text-5xl">
              {WEBINAR.title}
            </h1>
            <p className="mt-4 max-w-xl text-text-muted">{WEBINAR.subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" /> {WEBINAR.dateLabel}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> {WEBINAR.timeLabel}</span>
            </div>
            <p className="mt-1 text-sm text-text-subtle">{WEBINAR.durationLabel}</p>

            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-subtle">Webinar starts in</p>
              <Countdown target={WEBINAR.startsAt} />
            </div>
          </div>

          {/* Register card */}
          <div className="lg:sticky lg:top-6">
            <WebinarRegister />
          </div>
        </div>
      </section>

      {/* What you get, the highlight: live, playable demos */}
      <section className="border-t border-border bg-surface-2 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              Try it before you register
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-text sm:text-3xl">Everything you get with Dubaikar</h2>
            <p className="mt-2 text-text-muted">
              The webinar is your starting point. Registration unlocks the full toolkit, and you can
              play with the resume builder and interview notes right here, no sign-up needed.
            </p>
          </div>
          <div className="mt-8">
            <FeatureShowcase />
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-text">What we&apos;ll cover</h2>
            <ul className="mt-5 space-y-3">
              {WEBINAR.agenda.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-text">Common questions</h2>
            <div className="mt-5 space-y-3">
              {WEBINAR.faqs.map((f) => (
                <details key={f.q} className="group rounded-[var(--radius-card)] border border-border bg-surface p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-text">
                    {f.q}
                    <span className="ml-2 text-text-subtle transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-brand-soft py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-text">Ready to make your Dubai move easier?</h2>
          <p className="mx-auto mt-2 max-w-md text-text-muted">
            Reserve your seat for ₹{WEBINAR.priceInr}. You&apos;ll join the WhatsApp group right
            after payment and get the recording, notes, and question bank.
          </p>
          <a href="#register" className="btn btn-primary btn-lg mt-6">
            Register now · ₹{WEBINAR.priceInr}
          </a>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-subtle">
            <Check className="h-3.5 w-3.5 text-success" /> {WEBINAR_DISCLAIMER}
          </p>
        </div>
      </section>
    </>
  );
}
