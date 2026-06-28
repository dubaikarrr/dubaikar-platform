"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2, Save, Download, ScanLine, Target, Check, X, Eye } from "lucide-react";
import type {
  Resume, ResumeData, ResumeExperience, ResumeEducation,
} from "@/lib/database.types";
import {
  SECTION_DEFS,
} from "@/lib/tools/resume-templates";
import {
  TEMPLATE_DEFS, PALETTES, ACCENT_SWATCHES, HEADING_FONTS, BODY_FONTS, seedTemplate,
  type TemplateFamily,
} from "@/lib/resume/theme";
import { scoreResumeLocal, type AtsResult } from "@/lib/tools/ats";
import { matchJd, type JdMatchResult } from "@/lib/tools/jd-match";
import { saveResume } from "@/lib/actions/resume";
import { ResumePreview } from "@/components/tools/resume/resume-preview";
import { AtsCategories, AtsIssues } from "@/components/tools/resume/ats-badge";
import { SectionCard } from "@/components/tools/resume/editor/section-card";
import { RichText } from "@/components/tools/resume/editor/rich-text";
import { PhotoUpload } from "@/components/tools/resume/editor/photo-upload";
import { TemplateThumb } from "@/components/tools/resume/template-thumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Label, Textarea } from "@/components/ui/field";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { RESUME_CSS } from "@/lib/resume/resume-css";
import { cn } from "@/lib/utils";

const SECTION_LABELS = Object.fromEntries(SECTION_DEFS.map((s) => [s.key, s.label]));
const TABS = [
  { key: "edit", label: "Edit" },
  { key: "ats", label: "ATS score" },
  { key: "jd", label: "JD match" },
  { key: "templates", label: "Templates" },
  { key: "customize", label: "Customize" },
];
const FAMILIES: TemplateFamily[] = ["Header band", "Two-column", "Timeline & creative", "Minimal & serif"];

function atsTone(score: number) {
  return score >= 75 ? "success" : score >= 50 ? "warning" : "danger";
}

export function ResumeBuilder({ resume }: { resume: Resume }) {
  const [data, setData] = useState<ResumeData>(resume.data);
  const [tab, setTab] = useState("edit");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ personal: true, experience: true });
  const [ats, setAts] = useState<AtsResult | null>(
    resume.ats_score != null ? scoreResumeLocal(resume.data) : null,
  );
  const [scanning, setScanning] = useState(false);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [jdText, setJdText] = useState("");
  const [jd, setJd] = useState<JdMatchResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const patch = useCallback((fn: (d: ResumeData) => ResumeData) => {
    setData((prev) => fn(structuredClone(prev)));
  }, []);

  const order = data.layout?.order ?? SECTION_DEFS.map((s) => s.key);
  const hidden = new Set(data.layout?.hidden ?? []);
  const completion = useMemo(() => computeCompletion(data), [data]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    patch((d) => {
      const ord = d.layout?.order ?? [];
      d.layout = { order: arrayMove(ord, ord.indexOf(String(active.id)), ord.indexOf(String(over.id))), hidden: d.layout?.hidden ?? [] };
      return d;
    });
  }
  function toggleHidden(key: string) {
    patch((d) => {
      const h = new Set(d.layout?.hidden ?? []);
      h.has(key) ? h.delete(key) : h.add(key);
      d.layout = { order: d.layout?.order ?? [], hidden: [...h] };
      return d;
    });
  }
  const toggleOpen = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/ats-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      const json = res.ok ? await res.json() : null;
      setAts(json?.result ?? scoreResumeLocal(data));
    } catch { setAts(scoreResumeLocal(data)); }
    setScanning(false);
  }
  function save() {
    setStatus(null);
    startSaving(async () => {
      const { default: DOMPurify } = await import("dompurify");
      const clean = sanitizeResume(data, (h) => DOMPurify.sanitize(h));
      const r = await saveResume(resume.id, clean, ats?.score ?? null);
      setStatus(r.ok ? "Saved" : r.error ?? "Failed to save");
    });
  }
  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.title || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus("PDF download failed, try again.");
    }
    setDownloading(false);
  }

  function runJd() {
    if (jdText.trim().length < 20) { setJd(null); return; }
    setJd(matchJd(data, jdText));
  }
  function addMissingSkills() {
    if (!jd) return;
    patch((d) => { d.skills = Array.from(new Set([...d.skills, ...jd.missing])); return d; });
  }
  function addCustomSection() {
    const id = `custom_${Date.now()}`;
    patch((d) => {
      d.customSections = [...(d.customSections ?? []), { id, title: "New section", itemsHtml: "" }];
      d.layout = { order: [...(d.layout?.order ?? []), id], hidden: d.layout?.hidden ?? [] };
      return d;
    });
    setOpen((o) => ({ ...o, [id]: true }));
  }

  const preview = (
    <div className="h-[60vh] overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-2 p-3 lg:h-[calc(100vh-104px)]">
      <ResumePreview data={data} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="text-text">{resume.title}</h1>
          <p className="text-xs text-text-subtle capitalize">
            {data.style?.template} · {completion}% complete
          </p>
        </div>
        {ats ? <Badge tone={atsTone(ats.score)} dot>ATS {ats.score}/100</Badge> : null}
        <Button variant="secondary" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
        </Button>
        <Button onClick={downloadPdf} disabled={downloading}>
          <Download className="h-4 w-4" /> {downloading ? "Preparing…" : "Download PDF"}
        </Button>
        {status ? <span className="w-full text-xs text-text-muted sm:w-auto">{status}</span> : null}
      </div>

      {/* Tabs */}
      <div className="tabs overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} className={cn("tab", tab === t.key && "active")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {tab === "edit" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">Sections</span>
                <span className="text-xs text-text-subtle">drag · click · hide</span>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-surface">
              <button onClick={() => toggleOpen("personal")} className="w-full px-3 py-2.5 text-left text-sm font-medium text-text">
                Personal details
              </button>
              {open.personal ? <div className="border-t border-border p-3"><PersonalEditor data={data} patch={patch} /></div> : null}
            </div>

            <DndContext id="resume-sections" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={order} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {order.map((key) => (
                    <SectionCard key={key} id={key}
                      title={SECTION_LABELS[key] ?? data.customSections?.find((c) => c.id === key)?.title ?? key}
                      open={!!open[key]} hidden={hidden.has(key)} complete={sectionHasContent(data, key)}
                      onToggleOpen={() => toggleOpen(key)} onToggleHidden={() => toggleHidden(key)}>
                      <SectionEditor sectionKey={key} data={data} patch={patch} />
                    </SectionCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button variant="ghost" className="w-full border border-dashed border-border-strong" onClick={addCustomSection}>
              <Plus className="h-4 w-4" /> Add custom section
            </Button>
          </div>
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{preview}</div>
        </div>
      )}

      {tab === "ats" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="flex items-center gap-4 p-5">
              <ScoreRing score={ats?.score ?? 0} />
              <div>
                <h3 className="text-text">{ats ? ats.label : "Not scanned yet"}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {ats ? "Based on Dubai/UAE recruiter benchmarks." : "Run a scan to score your resume out of 100."}
                </p>
                <Button size="sm" className="mt-2" onClick={scan} disabled={scanning}>
                  <ScanLine className="h-4 w-4" /> {scanning ? "Scanning…" : ats ? "Re-scan" : "Scan ATS"}
                </Button>
              </div>
            </Card>
            {ats ? (
              <>
                <Card className="p-5"><AtsCategories result={ats} /></Card>
                <div>
                  <p className="mb-2 text-sm font-medium text-text">Fixes &amp; suggestions</p>
                  <AtsIssues result={ats} />
                </div>
              </>
            ) : null}
          </div>
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{preview}</div>
        </div>
      )}

      {tab === "jd" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Paste a job description">
              <Textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the JD here to see how well your resume matches…" style={{ minHeight: 140 }} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={runJd}><Target className="h-4 w-4" /> Match my resume</Button>
              <Button variant="ghost" onClick={() => { setJd(null); setJdText(""); }}>Clear</Button>
            </div>
            {jd ? (
              <Card className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                  <ScoreRing score={jd.matchPct} label="match" />
                  <p className="text-sm text-text">
                    You match <b className="text-brand">{jd.matchPct}%</b>. Add the {jd.missing.length} missing keywords to improve.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"><Check className="h-4 w-4 text-success" /> Matched ({jd.matched.length})</p>
                    <div className="flex flex-wrap gap-1.5">{jd.matched.map((k) => <Badge key={k} tone="success" dot>{k}</Badge>)}</div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"><X className="h-4 w-4 text-danger" /> Missing ({jd.missing.length})</p>
                    <div className="flex flex-wrap gap-1.5">{jd.missing.map((k) => <Badge key={k} tone="danger">{k}</Badge>)}</div>
                    {jd.missing.length ? <Button size="sm" className="mt-3" onClick={addMissingSkills}><Plus className="h-4 w-4" /> Add missing skills</Button> : null}
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{preview}</div>
        </div>
      )}

      {tab === "templates" && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />
          <div className="app-scroll space-y-5 lg:max-h-[calc(100vh-104px)] lg:overflow-auto lg:pr-1">
            <p className="text-sm text-text-muted">Pick a design, switching keeps your content and applies the template&apos;s signature colours.</p>
            {FAMILIES.map((fam) => (
              <div key={fam}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">{fam}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TEMPLATE_DEFS.filter((t) => t.family === fam).map((t) => {
                    const on = (data.style?.template ?? "corporate") === t.key;
                    return (
                      <button key={t.key}
                        onClick={() => patch((d) => { d.style = seedTemplate(d.style!, t.key); return d; })}
                        className={cn("card hovcard p-2 text-left", on && "ring-2 ring-brand")}
                        style={on ? { borderColor: "var(--accent)" } : undefined}>
                        <TemplateThumb data={data} templateKey={t.key} width={180} />
                        <div className="mt-2 flex items-center justify-between px-0.5">
                          <span className="text-sm font-medium text-text">{t.label}</span>
                          {on ? <Check className="h-4 w-4 text-brand" /> : <span className="text-xs text-text-subtle">{t.columns === "double" ? "2-col" : "1-col"}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{preview}</div>
        </div>
      )}

      {tab === "customize" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CustomizePanel data={data} patch={patch} />
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{preview}</div>
        </div>
      )}

      {/* Mobile: floating Preview button + full-screen preview overlay */}
      <button
        onClick={() => setShowPreviewMobile(true)}
        className="btn btn-primary fixed bottom-20 right-4 z-40 shadow-pop lg:hidden"
        aria-label="Preview resume"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>
      {showPreviewMobile ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-text">Resume preview</span>
            <button onClick={() => setShowPreviewMobile(false)} className="btn btn-ghost btn-icon btn-sm" aria-label="Close preview">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-surface-2 p-3">
            <ResumePreview data={data} />
          </div>
          <div className="border-t border-border p-3">
            <Button block onClick={downloadPdf} disabled={downloading}>
              <Download className="h-4 w-4" /> {downloading ? "Preparing…" : "Download PDF"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- score ring */
function ScoreRing({ score, size = 116, label = "ATS score" }: { score: number; size?: number; label?: string }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = score >= 80 ? "var(--success)" : score >= 60 ? "var(--accent)" : "var(--warning)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted-fill)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * Math.max(0, Math.min(100, score))) / 100} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="tnum" style={{ fontSize: size * 0.3, fontWeight: 500, lineHeight: 1, color: tone }}>{Math.round(score)}</span>
        <span className="text-[11px] text-text-subtle" style={{ marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- helpers */
function computeCompletion(d: ResumeData): number {
  const checks = [
    !!d.personal.fullName, !!d.personal.jobTitle, !!d.personal.email, !!d.personal.phone,
    !!d.personal.summaryHtml, d.experience.length > 0, d.education.length > 0,
    d.skills.length >= 4, !!d.personal.visaStatus,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
function sectionHasContent(d: ResumeData, key: string): boolean {
  switch (key) {
    case "summary": return !!d.personal.summaryHtml;
    case "experience": return d.experience.length > 0;
    case "education": return d.education.length > 0;
    case "skills": return d.skills.length > 0;
    case "projects": return !!d.projects?.length;
    case "certifications": return !!d.certifications?.length;
    case "awards": return !!d.awards?.length;
    case "languages": return !!d.languages?.length;
    case "references": return d.references?.mode !== "hidden";
    default: return !!d.customSections?.find((c) => c.id === key)?.itemsHtml;
  }
}
function sanitizeResume(d: ResumeData, clean: (html: string) => string): ResumeData {
  const c = structuredClone(d);
  if (c.personal.summaryHtml) c.personal.summaryHtml = clean(c.personal.summaryHtml);
  c.experience = c.experience.map((x) => ({ ...x, descriptionHtml: x.descriptionHtml ? clean(x.descriptionHtml) : x.descriptionHtml }));
  c.projects = c.projects?.map((p) => ({ ...p, descriptionHtml: p.descriptionHtml ? clean(p.descriptionHtml) : p.descriptionHtml }));
  c.awards = c.awards?.map((a) => ({ ...a, descriptionHtml: a.descriptionHtml ? clean(a.descriptionHtml) : a.descriptionHtml }));
  c.customSections = c.customSections?.map((s) => ({ ...s, itemsHtml: s.itemsHtml ? clean(s.itemsHtml) : s.itemsHtml }));
  return c;
}
type Patch = (fn: (d: ResumeData) => ResumeData) => void;

/* ---------------------------------------------------------------- editors */
function PersonalEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const p = data.personal;
  const set = (k: keyof ResumeData["personal"], v: string) => patch((d) => { (d.personal as Record<string, unknown>)[k] = v; return d; });
  return (
    <div className="space-y-3">
      <PhotoUpload photo={p.photo} shape={p.photoShape} onChange={(photo, shape) => patch((d) => { d.personal.photo = photo; if (shape) d.personal.photoShape = shape; return d; })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name"><Input value={p.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
        <Field label="Job title"><Input value={p.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} /></Field>
        <Field label="Email"><Input value={p.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone"><Input value={p.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Location"><Input value={p.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="LinkedIn"><Input value={p.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} /></Field>
        <Field label="Website / portfolio"><Input value={p.website ?? ""} onChange={(e) => set("website", e.target.value)} /></Field>
        <Field label="Nationality"><Input value={p.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} /></Field>
        <Field label="Visa status" hint="Key Dubai ATS filter."><Input value={p.visaStatus ?? ""} onChange={(e) => set("visaStatus", e.target.value)} placeholder="Visit visa / employment visa" /></Field>
        <Field label="Notice period"><Input value={p.noticePeriod ?? ""} onChange={(e) => set("noticePeriod", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function SectionEditor({ sectionKey, data, patch }: { sectionKey: string; data: ResumeData; patch: Patch }) {
  switch (sectionKey) {
    case "summary":
      return <RichText value={data.personal.summaryHtml ?? ""} placeholder="2–3 lines. Lead with your role, years of experience, and strengths." onChange={(html) => patch((d) => { d.personal.summaryHtml = html; d.personal.summary = stripHtml(html); return d; })} />;
    case "experience": return <ExperienceEditor data={data} patch={patch} />;
    case "education": return <EducationEditor data={data} patch={patch} />;
    case "skills": return <SkillsEditor data={data} patch={patch} />;
    case "projects": return <ProjectsEditor data={data} patch={patch} />;
    case "certifications": return <CertificationsEditor data={data} patch={patch} />;
    case "awards": return <AwardsEditor data={data} patch={patch} />;
    case "languages": return <LanguagesEditor data={data} patch={patch} />;
    case "references": return <ReferencesEditor data={data} patch={patch} />;
    default: return <CustomSectionEditor sectionKey={sectionKey} data={data} patch={patch} />;
  }
}

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button variant="secondary" size="sm" onClick={onClick} className="w-full"><Plus className="h-4 w-4" /> {label}</Button>
);
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="ghost" size="sm" className="text-danger" onClick={onClick}><Trash2 className="h-4 w-4" /> Remove</Button>
);

function ExperienceEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const upd = (i: number, k: keyof ResumeExperience, v: unknown) => patch((d) => { (d.experience[i] as Record<string, unknown>)[k] = v; return d; });
  return (
    <div className="space-y-3">
      {data.experience.map((x, i) => (
        <div key={i} className="space-y-2 rounded-[var(--radius-control)] border border-border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Role / title" value={x.role} onChange={(e) => upd(i, "role", e.target.value)} />
            <Input placeholder="Company" value={x.company} onChange={(e) => upd(i, "company", e.target.value)} />
            <Input placeholder="Location" value={x.location ?? ""} onChange={(e) => upd(i, "location", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="month" value={x.start ?? ""} onChange={(e) => upd(i, "start", e.target.value)} />
              <Input type="month" value={x.end ?? ""} disabled={x.current} onChange={(e) => upd(i, "end", e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={!!x.current} onChange={(e) => upd(i, "current", e.target.checked)} /> I currently work here
          </label>
          <RichText value={x.descriptionHtml ?? ""} placeholder="One achievement per bullet. Start with a verb and add numbers." onChange={(html) => upd(i, "descriptionHtml", html)} />
          <RemoveButton onClick={() => patch((d) => { d.experience.splice(i, 1); return d; })} />
        </div>
      ))}
      <AddButton label="Add experience" onClick={() => patch((d) => { d.experience.push({ role: "", company: "", descriptionHtml: "" }); return d; })} />
    </div>
  );
}

function EducationEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const upd = (i: number, k: keyof ResumeEducation, v: unknown) => patch((d) => { (d.education[i] as Record<string, unknown>)[k] = v; return d; });
  return (
    <div className="space-y-3">
      {data.education.map((e, i) => (
        <div key={i} className="grid gap-2 rounded-[var(--radius-control)] border border-border p-3 sm:grid-cols-2">
          <Input placeholder="Degree" value={e.degree} onChange={(ev) => upd(i, "degree", ev.target.value)} />
          <Input placeholder="Field" value={e.field ?? ""} onChange={(ev) => upd(i, "field", ev.target.value)} />
          <Input placeholder="Institution" value={e.institution} onChange={(ev) => upd(i, "institution", ev.target.value)} />
          <Input placeholder="Year" value={e.year ?? ""} onChange={(ev) => upd(i, "year", ev.target.value)} />
          <Input placeholder="Grade / score" value={e.grade ?? ""} onChange={(ev) => upd(i, "grade", ev.target.value)} />
          <div className="sm:col-span-2"><RemoveButton onClick={() => patch((d) => { d.education.splice(i, 1); return d; })} /></div>
        </div>
      ))}
      <AddButton label="Add education" onClick={() => patch((d) => { d.education.push({ degree: "", institution: "" }); return d; })} />
    </div>
  );
}

function SkillsEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  return (
    <div className="space-y-3">
      <Field label="Skills" hint="Comma-separated. Aim for 8+.">
        <Input value={data.skills.join(", ")} onChange={(e) => patch((d) => { d.skills = splitList(e.target.value); return d; })} placeholder="IFRS, financial reporting, Excel, audit, VAT…" />
      </Field>
      <Field label="Soft skills" hint="Comma-separated.">
        <Input value={(data.softSkills ?? []).join(", ")} onChange={(e) => patch((d) => { d.softSkills = splitList(e.target.value); return d; })} placeholder="Leadership, communication…" />
      </Field>
    </div>
  );
}

function ProjectsEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const list = data.projects ?? [];
  return (
    <div className="space-y-3">
      {list.map((p, i) => (
        <div key={i} className="space-y-2 rounded-[var(--radius-control)] border border-border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Project name" value={p.name} onChange={(e) => patch((d) => { d.projects![i].name = e.target.value; return d; })} />
            <Input placeholder="Link (optional)" value={p.link ?? ""} onChange={(e) => patch((d) => { d.projects![i].link = e.target.value; return d; })} />
          </div>
          <RichText value={p.descriptionHtml ?? ""} placeholder="What it was and your impact." onChange={(html) => patch((d) => { d.projects![i].descriptionHtml = html; return d; })} />
          <RemoveButton onClick={() => patch((d) => { d.projects!.splice(i, 1); return d; })} />
        </div>
      ))}
      <AddButton label="Add project" onClick={() => patch((d) => { d.projects = [...(d.projects ?? []), { name: "" }]; return d; })} />
    </div>
  );
}

function CertificationsEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const list = data.certifications ?? [];
  return (
    <div className="space-y-3">
      {list.map((c, i) => (
        <div key={i} className="grid gap-2 rounded-[var(--radius-control)] border border-border p-3 sm:grid-cols-3">
          <Input placeholder="Certification" value={c.name} onChange={(e) => patch((d) => { d.certifications![i].name = e.target.value; return d; })} />
          <Input placeholder="Issuer" value={c.issuer ?? ""} onChange={(e) => patch((d) => { d.certifications![i].issuer = e.target.value; return d; })} />
          <Input placeholder="Date" value={c.date ?? ""} onChange={(e) => patch((d) => { d.certifications![i].date = e.target.value; return d; })} />
          <div className="sm:col-span-3"><RemoveButton onClick={() => patch((d) => { d.certifications!.splice(i, 1); return d; })} /></div>
        </div>
      ))}
      <AddButton label="Add certification" onClick={() => patch((d) => { d.certifications = [...(d.certifications ?? []), { name: "" }]; return d; })} />
    </div>
  );
}

function AwardsEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const list = data.awards ?? [];
  return (
    <div className="space-y-3">
      {list.map((a, i) => (
        <div key={i} className="space-y-2 rounded-[var(--radius-control)] border border-border p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="Title" value={a.title} onChange={(e) => patch((d) => { d.awards![i].title = e.target.value; return d; })} />
            <Input placeholder="Issuer" value={a.issuer ?? ""} onChange={(e) => patch((d) => { d.awards![i].issuer = e.target.value; return d; })} />
            <Input placeholder="Date" value={a.date ?? ""} onChange={(e) => patch((d) => { d.awards![i].date = e.target.value; return d; })} />
          </div>
          <RemoveButton onClick={() => patch((d) => { d.awards!.splice(i, 1); return d; })} />
        </div>
      ))}
      <AddButton label="Add award" onClick={() => patch((d) => { d.awards = [...(d.awards ?? []), { title: "" }]; return d; })} />
    </div>
  );
}

function LanguagesEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const list = data.languages ?? [];
  return (
    <div className="space-y-2">
      {list.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Language" value={l.name} onChange={(e) => patch((d) => { d.languages![i].name = e.target.value; return d; })} />
          <Input placeholder="Proficiency" value={l.proficiency ?? ""} onChange={(e) => patch((d) => { d.languages![i].proficiency = e.target.value; return d; })} />
          <Button variant="ghost" size="sm" className="text-danger" onClick={() => patch((d) => { d.languages!.splice(i, 1); return d; })}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <AddButton label="Add language" onClick={() => patch((d) => { d.languages = [...(d.languages ?? []), { name: "" }]; return d; })} />
    </div>
  );
}

function ReferencesEditor({ data, patch }: { data: ResumeData; patch: Patch }) {
  const mode = data.references?.mode ?? "on-request";
  return (
    <div className="space-y-3">
      <Field label="References">
        <select className="input selectbox" value={mode} onChange={(e) => patch((d) => { d.references = { mode: e.target.value as "on-request" | "hidden" | "custom", items: d.references?.items }; return d; })}>
          <option value="on-request">Available upon request</option>
          <option value="custom">List specific references</option>
          <option value="hidden">Don&apos;t include</option>
        </select>
      </Field>
      {mode === "custom" ? (
        <div className="space-y-2">
          {(data.references?.items ?? []).map((r, i) => (
            <div key={i} className="grid gap-2 rounded-[var(--radius-control)] border border-border p-3 sm:grid-cols-2">
              <Input placeholder="Name" value={r.name} onChange={(e) => patch((d) => { d.references!.items![i].name = e.target.value; return d; })} />
              <Input placeholder="Title" value={r.title ?? ""} onChange={(e) => patch((d) => { d.references!.items![i].title = e.target.value; return d; })} />
              <Input placeholder="Company" value={r.company ?? ""} onChange={(e) => patch((d) => { d.references!.items![i].company = e.target.value; return d; })} />
              <Input placeholder="Contact" value={r.contact ?? ""} onChange={(e) => patch((d) => { d.references!.items![i].contact = e.target.value; return d; })} />
              <div className="sm:col-span-2"><RemoveButton onClick={() => patch((d) => { d.references!.items!.splice(i, 1); return d; })} /></div>
            </div>
          ))}
          <AddButton label="Add reference" onClick={() => patch((d) => { d.references = { mode: "custom", items: [...(d.references?.items ?? []), { name: "" }] }; return d; })} />
        </div>
      ) : null}
    </div>
  );
}

function CustomSectionEditor({ sectionKey, data, patch }: { sectionKey: string; data: ResumeData; patch: Patch }) {
  const idx = (data.customSections ?? []).findIndex((c) => c.id === sectionKey);
  const sec = data.customSections?.[idx];
  if (!sec) return null;
  return (
    <div className="space-y-2">
      <Field label="Section title"><Input value={sec.title} onChange={(e) => patch((d) => { d.customSections![idx].title = e.target.value; return d; })} /></Field>
      <RichText value={sec.itemsHtml ?? ""} placeholder="Content…" onChange={(html) => patch((d) => { d.customSections![idx].itemsHtml = html; return d; })} />
      <RemoveButton onClick={() => patch((d) => {
        d.customSections!.splice(idx, 1);
        d.layout = { order: (d.layout?.order ?? []).filter((k) => k !== sectionKey), hidden: (d.layout?.hidden ?? []).filter((k) => k !== sectionKey) };
        return d;
      })} />
    </div>
  );
}

function FontSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select className="input selectbox" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  );
}

const HEADING_STYLE_OPTS = [
  { key: "bar", label: "Bar" }, { key: "underline", label: "Underline" },
  { key: "rule", label: "Rule" }, { key: "side", label: "Side" }, { key: "block", label: "Block" },
];

function CustomizePanel({ data, patch }: { data: ResumeData; patch: Patch }) {
  const s = data.style!;
  const set = (k: keyof NonNullable<ResumeData["style"]>, v: unknown) => patch((d) => { (d.style as Record<string, unknown>)[k] = v; return d; });

  return (
    <div className="space-y-6 rounded-[var(--radius-card)] border border-border bg-surface p-5">
      {/* Palettes */}
      <div>
        <Label>Colour palette</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PALETTES.map((p) => {
            const on = s.accentColor === p.accent && s.secondaryColor === p.secondary;
            return (
              <button key={p.name} onClick={() => patch((d) => { d.style!.accentColor = p.accent; d.style!.secondaryColor = p.secondary; return d; })}
                className={cn("flex items-center gap-2 rounded-[var(--radius-control)] border px-2 py-1.5 text-left text-xs", on ? "border-brand bg-brand-soft" : "border-border")}>
                <span className="flex">
                  <span style={{ width: 14, height: 14, borderRadius: "3px 0 0 3px", background: p.accent }} />
                  <span style={{ width: 14, height: 14, borderRadius: "0 3px 3px 0", background: p.secondary }} />
                </span>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent + secondary pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Accent</Label>
          <div className="mt-2 flex items-center gap-2">
            <input type="color" value={s.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-9 w-12 rounded border border-border bg-surface" />
            <div className="flex flex-wrap gap-1">
              {ACCENT_SWATCHES.slice(0, 8).map((c) => (
                <button key={c} onClick={() => set("accentColor", c)} className="h-5 w-5 rounded" style={{ background: c, outline: s.accentColor === c ? "2px solid var(--text)" : "none" }} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label>Secondary</Label>
          <input type="color" value={s.secondaryColor ?? s.accentColor} onChange={(e) => set("secondaryColor", e.target.value)} className="mt-2 h-9 w-12 rounded border border-border bg-surface" />
        </div>
      </div>

      {/* Fonts */}
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Heading font</Label><div className="mt-2"><FontSelect value={s.headingFont ?? "Inter"} options={HEADING_FONTS} onChange={(v) => set("headingFont", v)} /></div></div>
        <div><Label>Body font</Label><div className="mt-2"><FontSelect value={s.bodyFont ?? "Inter"} options={BODY_FONTS} onChange={(v) => set("bodyFont", v)} /></div></div>
      </div>

      {/* Headings + divider */}
      <div>
        <Label>Section heading style</Label>
        <SegmentedTabs className="mt-2" value={s.headingStyle ?? "underline"} onChange={(v) => set("headingStyle", v)} tabs={HEADING_STYLE_OPTS} />
      </div>
      <div>
        <Label>Divider</Label>
        <SegmentedTabs className="mt-2" value={s.divider ?? "line"} onChange={(v) => set("divider", v)} tabs={[{ key: "line", label: "Line" }, { key: "dotted", label: "Dotted" }, { key: "none", label: "None" }]} />
      </div>

      {/* Section display options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Skills style</Label>
          <SegmentedTabs className="mt-2" value={s.skillsStyle ?? "chips"} onChange={(v) => set("skillsStyle", v)} tabs={[{ key: "chips", label: "Chips" }, { key: "inline", label: "Inline" }]} />
        </div>
        <div>
          <Label>Education</Label>
          <SegmentedTabs className="mt-2" value={s.eduStyle ?? "list"} onChange={(v) => set("eduStyle", v)} tabs={[{ key: "list", label: "List" }, { key: "table", label: "Table" }]} />
        </div>
      </div>

      {/* Sections show/hide */}
      <div>
        <Label>Sections</Label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[...SECTION_DEFS, ...(data.customSections ?? []).map((c) => ({ key: c.id, label: c.title }))].map((sec) => {
            const hidden = data.layout?.hidden?.includes(sec.key);
            return (
              <button key={sec.key}
                onClick={() => patch((d) => { const h = new Set(d.layout?.hidden ?? []); if (h.has(sec.key)) h.delete(sec.key); else h.add(sec.key); d.layout = { order: d.layout?.order ?? [], hidden: [...h] }; return d; })}
                className={cn("flex items-center justify-between rounded-[var(--radius-control)] border px-2.5 py-1.5 text-left text-xs", hidden ? "border-border text-text-subtle" : "border-brand/40 bg-brand-soft text-text")}>
                <span className="truncate">{sec.label}</span>
                <span className="text-[10px]">{hidden ? "Hidden" : "Shown"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout */}
      <div>
        <Label>Density</Label>
        <SegmentedTabs className="mt-2" value={s.density ?? "normal"} onChange={(v) => set("density", v)} tabs={[{ key: "compact", label: "Compact" }, { key: "normal", label: "Normal" }, { key: "relaxed", label: "Relaxed" }]} />
      </div>
      <div>
        <div className="flex justify-between"><Label>Line spacing</Label><span className="text-xs text-text-subtle">{(s.lineSpacing ?? 1.4).toFixed(2)}×</span></div>
        <input type="range" min={1} max={1.7} step={0.05} value={s.lineSpacing ?? 1.4} onChange={(e) => set("lineSpacing", Number(e.target.value))} className="mt-2 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Photo shape</Label>
          <SegmentedTabs className="mt-2" value={data.personal.photoShape ?? "round"} onChange={(v) => patch((d) => { d.personal.photoShape = v as "round" | "rect" | "square"; return d; })} tabs={[{ key: "round", label: "Round" }, { key: "rect", label: "Rounded" }, { key: "square", label: "Square" }]} />
        </div>
        <div>
          <div className="flex justify-between"><Label>Photo size</Label><span className="text-xs text-text-subtle">{s.photoSize ?? 66}px</span></div>
          <input type="range" min={48} max={96} step={2} value={s.photoSize ?? 66} onChange={(e) => set("photoSize", Number(e.target.value))} className="mt-2 w-full" />
        </div>
      </div>
      <label className="flex items-center justify-between rounded-[var(--radius-control)] border border-border p-3 text-sm text-text">
        <span><span className="font-medium">Show UAE fields</span><br /><span className="text-xs text-text-subtle">Visa, nationality, notice period</span></span>
        <input type="checkbox" checked={s.showUae ?? true} onChange={(e) => set("showUae", e.target.checked)} />
      </label>
      <label className="flex items-center justify-between rounded-[var(--radius-control)] border border-border p-3 text-sm text-text">
        <span><span className="font-medium">One-page mode</span><br /><span className="text-xs text-text-subtle">Condense spacing</span></span>
        <input type="checkbox" checked={s.onePage} onChange={(e) => set("onePage", e.target.checked)} />
      </label>

      <Button variant="secondary" className="w-full" onClick={() => patch((d) => { d.style = seedTemplate(d.style!, d.style!.template); return d; })}>
        Reset to template default
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- utils */
function splitList(v: string): string[] { return v.split(",").map((s) => s.trim()).filter(Boolean); }
function stripHtml(html: string): string { return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
