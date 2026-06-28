/**
 * ATS scoring. Mirrors the legacy local rubric (Website/index.html runATSLocal
 * ~7258) but operates on a ResumeData object instead of the DOM. Used as the
 * fallback when the Claude-powered scan (/api/ats-scan) is unavailable.
 */
import type { ResumeData } from "@/lib/database.types";

export type IssueType = "good" | "bad" | "warn";

export interface AtsIssue {
  type: IssueType;
  msg: string;
  section?: "personal" | "experience" | "education" | "skills";
}

export interface AtsImprovement {
  type: string;
  before: string;
  after: string;
}

export interface AtsResult {
  score: number;
  label: string;
  categories: {
    personal: number; // 0–100
    impact: number;
    formatting: number;
    content: number;
  };
  issues: AtsIssue[];
  improvements: AtsImprovement[];
  missingKeywords?: string[];
  tips?: string[];
}

const ACTION_VERBS =
  /^[•\-]?\s*(Led|Managed|Developed|Increased|Reduced|Implemented|Optimized|Achieved|Delivered|Spearheaded|Streamlined)/im;
const HAS_NUMBERS = /\d+%|\d+\+|AED\s*\d|USD\s*\d|\$\d/;

/** Plain-text bullets for an experience entry (rich HTML or legacy array). */
export function bulletsOf(x: {
  bullets?: string[];
  descriptionHtml?: string;
}): string[] {
  if (x.bullets && x.bullets.length) return x.bullets;
  if (x.descriptionHtml) {
    return x.descriptionHtml
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<\/(p|div|li|ul|ol)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function scoreResumeLocal(data: ResumeData): AtsResult {
  const issues: AtsIssue[] = [];
  const improvements: AtsImprovement[] = [];
  const p = data.personal;

  // Personal, max 25
  let personal = 0;
  if (p.fullName) personal += 4;
  else issues.push({ type: "bad", msg: "Name missing", section: "personal" });
  if (p.jobTitle) {
    personal += 5;
    issues.push({ type: "good", msg: "Job title present, 10.6× more interviews", section: "personal" });
  } else {
    issues.push({ type: "bad", msg: "No job title, the #1 ATS filter", section: "personal" });
  }
  if (p.email) personal += 3;
  else issues.push({ type: "bad", msg: "Email missing", section: "personal" });
  if (p.phone) personal += 3;
  else issues.push({ type: "bad", msg: "Phone missing", section: "personal" });
  if (p.location) personal += 2;
  if (p.linkedin) personal += 2;
  else issues.push({ type: "warn", msg: "Add LinkedIn, 87% of recruiters check", section: "personal" });
  if (p.visaStatus) {
    personal += 4;
    issues.push({ type: "good", msg: "Visa status present, critical for Dubai", section: "personal" });
  } else {
    issues.push({ type: "bad", msg: "No visa status, the #1 Dubai filter", section: "personal" });
  }
  if (p.noticePeriod) personal += 2;

  // Impact, max 35
  let impact = 0;
  const exps = data.experience ?? [];
  if (exps.length >= 2) {
    impact += 8;
    issues.push({ type: "good", msg: `${exps.length} experience entries`, section: "experience" });
  } else if (exps.length === 1) {
    impact += 4;
    issues.push({ type: "warn", msg: "Only 1 experience entry, add more", section: "experience" });
  } else {
    issues.push({ type: "bad", msg: "No experience listed", section: "experience" });
  }

  let hasNums = false;
  let hasVerbs = false;
  let fullText = "";
  for (const x of exps) {
    const xb = bulletsOf(x);
    const text = xb.join("\n");
    fullText += " " + text;
    if (HAS_NUMBERS.test(text)) hasNums = true;
    if (ACTION_VERBS.test(text)) hasVerbs = true;
    for (const raw of xb) {
      const b = raw.replace(/^[•\-*]\s*/, "").trim();
      if (b.length <= 10) continue;
      if (!/\d/.test(b)) {
        let imp = b;
        if (/led|managed/i.test(b)) imp += " resulting in 20% improvement";
        else if (/developed|created/i.test(b)) imp += " serving 500+ users";
        else imp += " achieving measurable impact";
        improvements.push({ type: "Add metrics", before: `• ${b}`, after: `• ${imp}` });
      }
      if (/^(responsible for|worked on|helped with|assisted in)/i.test(b)) {
        const imp = b
          .replace(/^responsible for/i, "Managed")
          .replace(/^worked on/i, "Developed")
          .replace(/^helped with/i, "Contributed to")
          .replace(/^assisted in/i, "Supported");
        improvements.push({ type: "Weak verb", before: `• ${b}`, after: `• ${imp}` });
      }
    }
  }
  if (hasNums) {
    impact += 10;
    issues.push({ type: "good", msg: "Quantified achievements detected" });
  } else if (exps.length > 0) {
    issues.push({ type: "bad", msg: "No metrics, add numbers / percentages", section: "experience" });
  }
  if (hasVerbs) {
    impact += 7;
    issues.push({ type: "good", msg: "Strong action verbs" });
  } else if (exps.length > 0) {
    issues.push({ type: "warn", msg: "Start bullets with: Led, Managed, Developed", section: "experience" });
  }

  const skills = (data.skills ?? []).filter(Boolean);
  if (skills.length >= 8) {
    impact += 10;
    issues.push({ type: "good", msg: `${skills.length} skills, excellent` });
  } else if (skills.length >= 4) {
    impact += 5;
    issues.push({ type: "warn", msg: `${skills.length} skills, add 8+ for best match`, section: "skills" });
  } else {
    issues.push({ type: "bad", msg: "Too few skills, 76% of recruiters filter by skills", section: "skills" });
  }

  // Formatting, max 20
  let formatting = 0;
  if ((data.education ?? []).length > 0) formatting += 6;
  else issues.push({ type: "bad", msg: "No education listed", section: "education" });
  const sl = (p.summary ?? "").length;
  if (sl >= 150 && sl <= 400) {
    formatting += 8;
    issues.push({ type: "good", msg: `Summary ${sl} chars, ideal` });
  } else if (sl > 0) {
    formatting += 4;
    issues.push({ type: "warn", msg: `Summary ${sl < 150 ? "too short" : "too long"} (${sl} chars)`, section: "personal" });
  } else {
    issues.push({ type: "bad", msg: "No professional summary", section: "personal" });
  }
  if ((data.languages ?? []).length > 0) formatting += 6;

  // Content, max 20
  let content = 0;
  const haystack = (fullText + " " + (p.summary ?? "")).toLowerCase();
  const repeated = skills.filter((s) => haystack.includes(s.trim().toLowerCase()));
  if (repeated.length >= 3) {
    content += 8;
    issues.push({ type: "good", msg: `${repeated.length} skills echoed in summary/experience` });
  } else {
    issues.push({ type: "warn", msg: "Repeat key skills in your experience bullets", section: "experience" });
  }
  if (exps.some((x) => bulletsOf(x).join("").length > 80)) content += 6;
  if (p.noticePeriod) content += 3;
  if (p.nationality) content += 3;

  const score = Math.min(100, personal + impact + formatting + content);
  const label = score >= 75 ? "ATS ready" : score >= 50 ? "Needs improvement" : "Needs work";

  return {
    score,
    label,
    categories: {
      personal: Math.round((personal / 25) * 100),
      impact: Math.round((impact / 35) * 100),
      formatting: Math.round((formatting / 20) * 100),
      content: Math.round((content / 20) * 100),
    },
    issues,
    improvements: improvements.slice(0, 6),
  };
}
