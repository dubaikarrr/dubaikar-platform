"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

const ACCENTS = [
  { key: "navy", color: "#1A1D3E" },
  { key: "orange", color: "#EA580C" },
  { key: "teal", color: "#0D9488" },
  { key: "violet", color: "#7C3AED" },
];

/** A genuinely live mini resume builder: type, recolour, switch layout. */
export function ResumeDemo() {
  const [name, setName] = useState("Rahul Sharma");
  const [role, setRole] = useState("Senior Accountant");
  const [accent, setAccent] = useState(ACCENTS[1].color);
  const [sidebar, setSidebar] = useState(false);

  // A light, honest "ATS-style" score that responds to completeness.
  const score = useMemo(() => {
    let s = 58;
    if (name.trim()) s += 10;
    if (role.trim()) s += 12;
    if (role.toLowerCase().match(/account|finance|engineer|manager|analyst/)) s += 12;
    if (name.trim().split(" ").length >= 2) s += 8;
    return Math.min(98, s);
  }, [name, role]);

  return (
    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
      {/* Controls */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-subtle">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input input-sm" placeholder="Your name" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-subtle">Job title</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="input input-sm" placeholder="e.g. Accountant" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-subtle">Accent colour</label>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAccent(a.color)}
                aria-label={a.key}
                className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all"
                style={{ background: a.color, boxShadow: accent === a.color ? `0 0 0 2px ${a.color}` : "none", outline: "none" }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-subtle">Layout</label>
          <div className="seg w-full">
            <button className={!sidebar ? "active" : ""} onClick={() => setSidebar(false)}>Classic</button>
            <button className={sidebar ? "active" : ""} onClick={() => setSidebar(true)}>Sidebar</button>
          </div>
        </div>
        <p className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-success-soft px-2.5 py-1.5 text-xs text-success">
          <Sparkles className="h-3.5 w-3.5" /> ATS score <b className="tabular-nums">{score}/100</b>
        </p>
      </div>

      {/* Live A4 preview */}
      <div className="overflow-hidden rounded-[var(--radius-control)] border border-border bg-white shadow-sm">
        {sidebar ? (
          <div className="grid grid-cols-[34%_1fr] text-[10px] leading-relaxed">
            <div className="p-3 text-white" style={{ background: accent }}>
              <div className="mb-2 h-10 w-10 rounded-full bg-white/25" />
              <p className="font-semibold leading-tight">{name || "Your name"}</p>
              <p className="opacity-80">{role || "Job title"}</p>
              <div className="mt-3 space-y-1 opacity-90">
                <p className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> you@email.com</p>
                <p className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> +971 50 000 0000</p>
                <p className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> Dubai, UAE</p>
              </div>
              <p className="mt-3 font-semibold uppercase tracking-wide">Skills</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {["IFRS", "Audit", "Excel", "VAT"].map((s) => (
                  <span key={s} className="rounded-full bg-white/20 px-1.5 py-0.5">{s}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2 p-3 text-slate-700">
              <Body accent={accent} role={role} />
            </div>
          </div>
        ) : (
          <div className="p-4 text-[10px] leading-relaxed text-slate-700">
            <div className="border-b-2 pb-2" style={{ borderColor: accent }}>
              <p className="text-base font-semibold leading-none" style={{ color: accent }}>{name || "Your name"}</p>
              <p className="mt-1 font-medium uppercase tracking-wide text-slate-500">{role || "Job title"}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-slate-500">
                <span>you@email.com</span><span>+971 50 000 0000</span><span>Dubai, UAE</span>
              </p>
            </div>
            <div className="mt-2 space-y-2">
              <Body accent={accent} role={role} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Heading({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <p className="font-semibold uppercase tracking-wide" style={{ color: accent }}>{children}</p>;
}

function Body({ accent, role }: { accent: string; role: string }) {
  return (
    <>
      <div>
        <Heading accent={accent}>Summary</Heading>
        <p className="text-slate-600">
          {role || "Professional"} with UAE-ready experience, relocating to Dubai. Strong on
          compliance, reporting, and stakeholder communication.
        </p>
      </div>
      <div>
        <Heading accent={accent}>Experience</Heading>
        <p className="font-medium text-slate-800">{role || "Job title"} · Acme Pvt Ltd</p>
        <p className="text-slate-500">2021 to present · Pune, India</p>
        <ul className="ml-3 list-disc text-slate-600">
          <li>Owned monthly close and statutory reporting for a 200-cr entity.</li>
          <li>Cut reconciliation time 40% with a revamped workflow.</li>
        </ul>
      </div>
      <div>
        <Heading accent={accent}>Education</Heading>
        <p className="text-slate-600">B.Com · University of Pune · 2018</p>
      </div>
    </>
  );
}
