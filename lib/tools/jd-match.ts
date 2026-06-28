import type { ResumeData } from "@/lib/database.types";
import { bulletsOf } from "@/lib/tools/ats";

const STOP = new Set(
  "a an the and or for to of in on with at by from as is are be we you your our their his her this that will should must have has had who whom which what when where why how role responsibilities requirements experience years strong good excellent ability team work working candidate looking ideal plus etc using able across within into out over more most than then them they it its".split(/\s+/),
);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) ?? []).filter((w) => !STOP.has(w));
}

function resumeText(data: ResumeData): string {
  const parts = [
    data.personal.jobTitle,
    data.personal.summary,
    data.skills.join(" "),
    (data.softSkills ?? []).join(" "),
    ...data.experience.map((x) => `${x.role} ${x.company} ${bulletsOf(x).join(" ")}`),
    ...(data.certifications ?? []).map((c) => c.name),
  ];
  return parts.filter(Boolean).join(" ");
}

export interface JdMatchResult {
  matchPct: number;
  matched: string[];
  missing: string[];
}

/** Keyword overlap between a job description and the resume. */
export function matchJd(data: ResumeData, jd: string): JdMatchResult {
  const have = new Set(tokens(resumeText(data)));
  // Frequency-rank JD keywords, keep the most salient.
  const freq = new Map<string, number>();
  for (const t of tokens(jd)) freq.set(t, (freq.get(t) ?? 0) + 1);
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 25);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of keywords) (have.has(k) ? matched : missing).push(k);

  const pct = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  return { matchPct: pct, matched, missing };
}
