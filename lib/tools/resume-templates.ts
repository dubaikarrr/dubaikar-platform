import type {
  ResumeData,
  ResumeStyle,
  ResumeLayout,
} from "@/lib/database.types";

export interface ResumeTemplate {
  key: string;
  label: string;
  description: string;
  columns: "single" | "double";
}

/** Template catalog, 5 premium, distinct designs. */
export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { key: "corporate", label: "Corporate", description: "Bold accent header + section bars", columns: "single" },
  { key: "modern", label: "Modern", description: "Accent sidebar + content", columns: "double" },
  { key: "accent", label: "Accent Header", description: "Colour band, clean body", columns: "single" },
  { key: "executive", label: "Executive", description: "Centered serif, understated", columns: "single" },
  { key: "classic", label: "Classic ATS", description: "Plain, maximum ATS safety", columns: "single" },
];

export const DEFAULT_ACCENT = "#FF6B35";

/** 12 accent themes (matches competitor breadth). */
export const THEME_COLORS: string[] = [
  "#1A1D3E", "#FF6B35", "#2563EB", "#0EA5E9", "#0F766E", "#16A34A",
  "#7C3AED", "#9333EA", "#DB2777", "#B91C1C", "#92400E", "#334155",
];

export const FONT_OPTIONS: { label: string; family: string; type: "sans" | "serif" }[] = [
  { label: "Inter", family: "Inter", type: "sans" },
  { label: "Roboto", family: "Roboto", type: "sans" },
  { label: "Open Sans", family: "Open Sans", type: "sans" },
  { label: "Lora", family: "Lora", type: "serif" },
  { label: "Merriweather", family: "Merriweather", type: "serif" },
];

/** Section keys in default display order. Personal is fixed at top. */
export const SECTION_DEFS: { key: string; label: string; fixed?: boolean }[] = [
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "awards", label: "Awards" },
  { key: "languages", label: "Languages" },
  { key: "references", label: "References" },
];

export const DEFAULT_STYLE: ResumeStyle = {
  template: "corporate",
  columns: "single",
  accentColor: "#1A1D3E",
  secondaryColor: "#3949AB",
  fontFamily: "Inter",
  fontType: "sans",
  headingFont: "Poppins",
  bodyFont: "Inter",
  headingStyle: "bar",
  divider: "line",
  density: "normal",
  lineSpacing: 1.4,
  onePage: false,
  showUae: true,
  photoSize: 66,
};

export const DEFAULT_LAYOUT: ResumeLayout = {
  order: SECTION_DEFS.map((s) => s.key),
  hidden: ["awards", "references"],
};

export function emptyResumeData(
  prefill?: Partial<ResumeData["personal"]>,
): ResumeData {
  return {
    personal: {
      fullName: prefill?.fullName ?? "",
      jobTitle: prefill?.jobTitle ?? "",
      email: prefill?.email ?? "",
      phone: prefill?.phone ?? "",
      location: prefill?.location ?? "Dubai, UAE",
      linkedin: "",
      nationality: prefill?.nationality ?? "Indian",
      visaStatus: prefill?.visaStatus ?? "",
      noticePeriod: "",
      summary: "",
      summaryHtml: "",
      photoShape: "round",
    },
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    languages: [
      { name: "English", proficiency: "Fluent" },
      { name: "Hindi", proficiency: "Native" },
    ],
    certifications: [],
    projects: [],
    awards: [],
    references: { mode: "on-request" },
    customSections: [],
    style: { ...DEFAULT_STYLE },
    layout: { ...DEFAULT_LAYOUT, order: [...DEFAULT_LAYOUT.order] },
  };
}

/**
 * Fill defaults and migrate legacy rows (bullets→descriptionHtml,
 * languages string[]→objects, top-level accentColor→style) so older saved
 * resumes load cleanly into the new editor.
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  const base = emptyResumeData();
  const d = (raw ?? {}) as Record<string, unknown> & Partial<ResumeData>;

  const personal = { ...base.personal, ...(d.personal ?? {}) };
  if (!personal.summaryHtml && personal.summary) {
    personal.summaryHtml = `<p>${escapeHtml(personal.summary)}</p>`;
  }

  const experience = (d.experience ?? []).map((x) => ({
    ...x,
    descriptionHtml:
      x.descriptionHtml ??
      (x.bullets && x.bullets.length
        ? `<ul>${x.bullets.map((b) => `<li>${escapeHtml(b.replace(/^[•\-*]\s*/, ""))}</li>`).join("")}</ul>`
        : ""),
  }));

  // Legacy languages stored as string[].
  let languages = d.languages as unknown;
  if (Array.isArray(languages) && typeof languages[0] === "string") {
    languages = (languages as unknown as string[]).map((name) => ({ name }));
  }

  const style: ResumeStyle = {
    ...base.style!,
    ...(d.style ?? {}),
    accentColor: d.style?.accentColor ?? d.accentColor ?? base.style!.accentColor,
  };

  const layout: ResumeLayout = {
    order: d.layout?.order?.length ? d.layout.order : base.layout!.order,
    hidden: d.layout?.hidden ?? base.layout!.hidden,
  };

  return {
    ...base,
    ...d,
    personal,
    experience,
    education: d.education ?? [],
    skills: d.skills ?? [],
    softSkills: d.softSkills ?? [],
    languages: (languages as ResumeData["languages"]) ?? base.languages,
    certifications: d.certifications ?? [],
    projects: d.projects ?? [],
    awards: d.awards ?? [],
    references: d.references ?? base.references,
    customSections: d.customSections ?? [],
    style,
    layout,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
