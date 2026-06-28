import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertCircle, ArrowRight, Star, Check, Sparkles, Calendar, Clock,
  Briefcase, Plane, Wallet, Home, FileText, MapPinned, Train, Calculator, MessageCircle, AtSign,
} from "lucide-react";
import { WEBINAR, WEBINAR_DISCLAIMER, WEBINAR_CHECKOUT_URL } from "@/lib/webinar";
import { FeatureShowcase } from "@/components/webinar/feature-showcase";
import { Countdown } from "@/components/webinar/countdown";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Dubaikar — your gateway to Dubai jobs, business setup & life",
  description:
    "From your first flight to your first paycheck to your first property. Free tools, a 1,300+ member community, and live webinars to help Indians move to Dubai.",
};

const CHECKOUT = WEBINAR_CHECKOUT_URL || "#webinar";
const EXTERNAL = WEBINAR_CHECKOUT_URL.startsWith("http");
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_URL || "#";

function RegisterButton({ label, light = false }: { label?: string; light?: boolean }) {
  const text = label ?? `Register for the webinar · ₹${WEBINAR.priceInr}`;
  const cls = light
    ? "hx-cta inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#FF6B35] shadow-lg transition-transform hover:-translate-y-0.5"
    : "hx-cta inline-flex items-center gap-2 rounded-full bg-[#FF6B35] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5";
  const props = EXTERNAL ? { href: CHECKOUT, target: "_blank", rel: "noopener" } : { href: "#webinar" };
  return (
    <a {...props} className={cls}>
      {text} <ArrowRight className="h-4 w-4" />
    </a>
  );
}

const PILLARS = [
  { icon: Briefcase, label: "Dubai job market" },
  { icon: Plane, label: "Relocation & visa" },
  { icon: Wallet, label: "Finance & compliance" },
  { icon: Home, label: "Housing & setup" },
];

const STATS = [
  { value: "1,300+", label: "Community members" },
  { value: "9+", label: "Sessions conducted" },
  { value: "4.9★", label: "Average rating" },
  { value: "100%", label: "Free tools & guides" },
];

const TOOLS = [
  { href: "/tools/budget", icon: Wallet, label: "Budget calculator", desc: "Know what your move really costs, in AED and ₹" },
  { href: "/tools/resume", icon: FileText, label: "Resume builder", desc: "A Dubai-ready CV with ATS scoring" },
  { href: "/login", icon: MapPinned, label: "Explore Dubai map", desc: "Where Indians live, rents, metro & schools" },
  { href: "/tools/metro", icon: Train, label: "Metro calculator", desc: "Find your cheapest commute" },
  { href: "/tools/offer-evaluator", icon: Calculator, label: "Offer evaluator", desc: "Judge a job offer properly" },
];

const TESTIMONIALS = [
  { stars: 5, text: "I liked how you explained things in a friendly manner and motivated the group to come up with questions and answer them.", name: "Session attendee", initial: "A" },
  { stars: 5, text: "It was really helpful, we got to know what needs to be done before coming to Dubai. Hope we can connect once I reach Dubai.", name: "Kripa A K", initial: "K" },
  { stars: 5, text: "Truly insightful on the Dubai job market: opportunities, hiring trends, salary, and real cost of living. They patiently answered every query with ground-level clarity.", name: "Hiral C", initial: "H" },
  { stars: 5, text: "Truly amazing and insightful session. Now I'm more thrilled to explore the Dubai market. Great energy from Sanket.", name: "Mohamed Shafi K S", initial: "M" },
];

const FOUNDERS = [
  { name: "CA Sanket Charthankar", role: "Co-Founder", bio: "Helping Indians crack the Dubai job market through content, community, and 1-on-1 guidance. Based in Dubai.", color: "#FF6B35" },
  { name: "CA Shivam Tathe", role: "Co-Founder", bio: "Chartered Accountant specialising in UAE finance, tax, and business setup. Guides expats on money and compliance.", color: "#00B4A6" },
];

export default function HomePage() {
  return (
    <div className="home-warm bg-[#FFF8F2] text-[#2D2B3A]">
      {/* Disclaimer */}
      <div className="border-b border-[#F5E6D3] bg-[#FFFBF7]">
        <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-3 text-sm text-[#6B6880]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
          <p>{WEBINAR_DISCLAIMER}</p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* animated aurora blobs */}
        <div className="hx-aurora -right-40 -top-40 h-96 w-96 bg-[#FF6B35]/25" style={{ position: "absolute" }} />
        <div className="hx-aurora -left-40 top-32 h-96 w-96 bg-[#00B4A6]/20" style={{ position: "absolute", animationDelay: "-6s" }} />
        <div className="hx-aurora left-1/3 top-72 h-72 w-72 bg-[#F5A623]/15" style={{ position: "absolute", animationDelay: "-11s" }} />
        {/* floating geometric shapes */}
        <div className="hx-geo left-[8%] top-28 hidden sm:block" style={{ animationDelay: "-3s" }}>
          <div className="h-12 w-12 rounded-xl border-2 border-[#FF6B35]" />
        </div>
        <div className="hx-geo right-[10%] top-44 hidden sm:block" style={{ animationDelay: "-8s" }}>
          <div className="h-8 w-8 rounded-full bg-[#00B4A6]" />
        </div>
        <div className="hx-geo right-[22%] bottom-16 hidden sm:block" style={{ animationDelay: "-14s" }}>
          <div className="h-10 w-10 rotate-45 border-2 border-[#F5A623]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:pt-20">
          <span className="hx-up hx-d1 inline-flex items-center gap-1.5 rounded-full border border-[#F5E6D3] bg-white px-4 py-1.5 text-sm font-medium text-[#1A1D3E] shadow-sm">
            🎙️ Live webinar this week · join 1,300+ members
          </span>
          <p className="hx-up hx-d1 mt-5 text-sm font-semibold uppercase tracking-wide text-[#FF6B35]">From job offers to business setup</p>
          <h1 className="hx-up hx-d2 mx-auto mt-2 max-w-2xl text-4xl font-bold leading-tight text-[#1A1D3E] sm:text-6xl">
            Your Dubai journey starts here
          </h1>
          <p className="hx-up hx-d3 mx-auto mt-5 max-w-xl text-lg text-[#6B6880]">
            From your first flight to your first paycheck to your first property. We help you navigate
            jobs, business setup, and investments in Dubai with ease. Everything you need to build your
            life in Dubai, all in one place.
          </p>
          <p className="hx-up hx-d3 mt-3 text-sm text-[#6B6880]">Built by CA Sanket Charthankar &amp; CA Shivam Tathe.</p>

          <div className="hx-up hx-d4 mt-8 flex flex-wrap items-center justify-center gap-3">
            <RegisterButton />
            <a href="#tools" className="inline-flex items-center gap-2 rounded-full border border-[#F5E6D3] bg-white px-7 py-3.5 text-base font-semibold text-[#1A1D3E] shadow-sm transition-transform hover:-translate-y-0.5">
              Explore free tools
            </a>
          </div>

          <div className="hx-up hx-d5 mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#F5E6D3] bg-white px-3 py-4 shadow-sm transition-transform hover:-translate-y-1">
                <p className="text-2xl font-bold text-[#FF6B35]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[#6B6880]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee trust strip */}
      <div className="hx-marquee-mask border-y border-[#F5E6D3] bg-[#FFFBF7] py-3">
        <div className="hx-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10 text-sm font-medium text-[#6B6880]" aria-hidden={dup === 1}>
              <span>🎙️ 9+ live sessions</span>
              <span>👥 1,300+ members</span>
              <span>⭐ 4.9 average rating</span>
              <span>🧾 Built by CAs</span>
              <span>🛠️ Free tools</span>
              <span>🇦🇪 Jobs · Visa · Setup</span>
              <span>💬 WhatsApp community</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <section className="bg-[#FFFBF7] py-16">
        <Reveal className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#00B4A6]">🌟 Our mission</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1A1D3E]">Guide every Indian to settle in Dubai</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#6B6880]">
            Dubai is full of opportunity, but navigating it alone is overwhelming. We exist so no one
            has to figure it out by themselves. From your first flight booking to your first salary
            credit, we guide, support, and walk with you every step of the way.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <span key={p.label} className="inline-flex items-center gap-2 rounded-full border border-[#F5E6D3] bg-white px-4 py-2 text-sm font-medium text-[#1A1D3E] shadow-sm">
                  <Icon className="h-4 w-4 text-[#FF6B35]" /> {p.label}
                </span>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Webinar = main CTA */}
      <section id="webinar" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* promo banner */}
          <div className="overflow-hidden rounded-3xl bg-[#1A1D3E] p-8 text-center text-white shadow-xl sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Flagship live webinar
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">{WEBINAR.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">{WEBINAR.subtitle}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#FF8F5E]" /> {WEBINAR.dateLabel}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#FF8F5E]" /> {WEBINAR.timeLabel}</span>
            </div>
            <div className="mt-6"><Countdown target={WEBINAR.startsAt} /></div>
            <div className="mt-7 flex justify-center"><RegisterButton light /></div>
            <p className="mt-3 text-xs text-white/60">{WEBINAR.durationLabel} · seats are limited</p>
          </div>

          {/* try-it-live demos */}
          <div className="mt-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35] px-3 py-1 text-xs font-semibold text-white">
              Try it before you register
            </span>
            <h3 className="mt-3 text-2xl font-bold text-[#1A1D3E]">Everything you get with Dubaikar</h3>
            <p className="mx-auto mt-2 max-w-xl text-[#6B6880]">
              Registration unlocks the full toolkit. Play with the resume builder and interview notes
              right here, no sign-up needed.
            </p>
          </div>
          <div className="mt-8"><FeatureShowcase /></div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="scroll-mt-20 bg-[#FFFBF7] py-16">
        <Reveal className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1A1D3E]">Everything you need to plan your Dubai move</h2>
            <p className="mx-auto mt-2 max-w-xl text-[#6B6880]">Free, practical tools. No paywall.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.label} href={t.href} className="group rounded-2xl border border-[#F5E6D3] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-semibold text-[#1A1D3E]">{t.label}</p>
                  <p className="mt-1 text-sm text-[#6B6880]">{t.desc}</p>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <Reveal className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1A1D3E]">What our members say</h2>
            <p className="mx-auto mt-2 max-w-xl text-[#6B6880]">Real reviews from real session attendees on Topmate.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
              <span><b className="text-[#FF6B35]">4.9</b> average rating</span>
              <span><b className="text-[#FF6B35]">13</b> verified reviews</span>
              <span><b className="text-[#FF6B35]">100%</b> would recommend</span>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-[#F5E6D3] bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-[#F5A623]">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-3 text-[#2D2B3A]">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1D3E] text-xs font-semibold text-white">{t.initial}</span>
                  <span className="text-sm font-medium text-[#1A1D3E]">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Founders */}
      <section id="founders" className="scroll-mt-20 bg-[#FFFBF7] py-16">
        <Reveal className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#00B4A6]">Behind Dubaikar</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1A1D3E]">Meet the founders</h2>
            <p className="mx-auto mt-2 max-w-xl text-[#6B6880]">
              The duo turning &ldquo;I want to move to Dubai&rdquo; into &ldquo;I just got hired in Dubai.&rdquo;
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="rounded-2xl border border-[#F5E6D3] bg-white p-6 text-center shadow-sm">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: f.color }}>
                  {f.name.split(" ").slice(-1)[0][0]}
                </span>
                <p className="mt-3 font-bold text-[#1A1D3E]">{f.name}</p>
                <p className="text-sm font-medium text-[#FF6B35]">{f.role}</p>
                <p className="mt-2 text-sm text-[#6B6880]">{f.bio}</p>
                <p className="mt-3 flex items-center justify-center gap-3 text-xs text-[#6B6880]">
                  <span className="inline-flex items-center gap-1"><AtSign className="h-3.5 w-3.5" /> dubaikarrr</span>
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Final CTA + WhatsApp */}
      <section className="py-16">
        <Reveal className="mx-auto max-w-5xl px-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#F5A623] p-10 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to make your Dubai move easier?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/90">
              Reserve your seat for ₹{WEBINAR.priceInr}. Join the WhatsApp group right after payment,
              and get the recording, interview notes, and the question bank.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <RegisterButton light />
              <a href={WHATSAPP} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10">
                <MessageCircle className="h-5 w-5" /> Join the WhatsApp channel
              </a>
            </div>
            <p className="mx-auto mt-5 flex max-w-md items-center justify-center gap-1.5 text-xs text-white/80">
              <Check className="h-3.5 w-3.5" /> {WEBINAR_DISCLAIMER}
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-[#6B6880]">
            Already a member?{" "}
            <Link href="/login" className="font-semibold text-[#FF6B35] hover:underline">Sign in to the platform</Link>
          </p>
        </Reveal>
      </section>
    </div>
  );
}
