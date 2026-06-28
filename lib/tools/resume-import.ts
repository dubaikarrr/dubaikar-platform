import type { ResumeData } from "@/lib/database.types";
import { emptyResumeData } from "@/lib/tools/resume-templates";
import { aiEnabled, generateJson } from "@/lib/ai";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Pull obvious contact fields out of raw resume text with regex. */
export function extractContacts(text: string) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = text.match(/(\+?\d[\d\s\-()]{7,}\d)/)?.[0]?.trim();
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0];
  // Name guess: first non-empty line that looks like a person's name.
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let fullName: string | undefined;
  for (const line of lines.slice(0, 6)) {
    if (/@|\d{3}|http|linkedin|resume|curriculum/i.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Za-z.\s]+$/.test(line)) {
      fullName = line;
      break;
    }
  }
  return { email, phone, linkedin, fullName };
}

/** No-AI fallback: prefill contacts, keep the full text in a review section. */
export function heuristicResume(text: string, fallbackName?: string): ResumeData {
  const { email, phone, linkedin, fullName } = extractContacts(text);
  const data = emptyResumeData({
    fullName: fullName ?? fallbackName ?? "",
    email: email ?? "",
    phone: phone ?? "",
  });
  if (linkedin) data.personal.linkedin = linkedin;

  // Preserve everything in a custom "review" section so nothing is lost.
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const id = "imported_review";
  data.customSections = [
    { id, title: "Imported content (review & organize)", itemsHtml: paras },
  ];
  data.layout = {
    order: [...(data.layout?.order ?? []), id],
    hidden: data.layout?.hidden ?? [],
  };
  return data;
}

interface AiResume {
  personal?: Partial<ResumeData["personal"]>;
  experience?: {
    role?: string; company?: string; location?: string;
    start?: string; end?: string; current?: boolean; bullets?: string[];
  }[];
  education?: { degree?: string; field?: string; institution?: string; year?: string; grade?: string }[];
  skills?: string[];
  languages?: { name?: string; proficiency?: string }[];
  certifications?: { name?: string; issuer?: string; date?: string }[];
}

/** AI path: structure the text into our ResumeData shape via Gemini. */
export async function aiStructureResume(text: string): Promise<ResumeData | null> {
  if (!aiEnabled()) return null;
  const prompt = `Extract this resume text into JSON. Return ONLY valid JSON, no markdown.
Shape:
{"personal":{"fullName":"","jobTitle":"","email":"","phone":"","location":"","linkedin":"","summary":""},
"experience":[{"role":"","company":"","location":"","start":"YYYY-MM","end":"YYYY-MM","current":false,"bullets":["",""]}],
"education":[{"degree":"","field":"","institution":"","year":"","grade":""}],
"skills":["",""],
"languages":[{"name":"","proficiency":""}],
"certifications":[{"name":"","issuer":"","date":""}]}

RESUME TEXT:
${text.slice(0, 12000)}`;

  const ai = await generateJson<AiResume>(prompt);
  if (!ai) return null;

  const data = emptyResumeData({
    fullName: ai.personal?.fullName ?? "",
    jobTitle: ai.personal?.jobTitle ?? "",
    email: ai.personal?.email ?? "",
    phone: ai.personal?.phone ?? "",
    location: ai.personal?.location ?? "Dubai, UAE",
  });
  if (ai.personal?.linkedin) data.personal.linkedin = ai.personal.linkedin;
  if (ai.personal?.summary) {
    data.personal.summary = ai.personal.summary;
    data.personal.summaryHtml = `<p>${escapeHtml(ai.personal.summary)}</p>`;
  }
  data.experience = (ai.experience ?? []).map((x) => ({
    role: x.role ?? "",
    company: x.company ?? "",
    location: x.location,
    start: x.start,
    end: x.end,
    current: x.current,
    descriptionHtml: x.bullets?.length
      ? `<ul>${x.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
      : "",
  }));
  data.education = (ai.education ?? []).map((e) => ({
    degree: e.degree ?? "",
    field: e.field,
    institution: e.institution ?? "",
    year: e.year,
    grade: e.grade,
  }));
  if (ai.skills?.length) data.skills = ai.skills;
  if (ai.languages?.length) data.languages = ai.languages.map((l) => ({ name: l.name ?? "", proficiency: l.proficiency }));
  if (ai.certifications?.length) data.certifications = ai.certifications.map((c) => ({ name: c.name ?? "", issuer: c.issuer, date: c.date }));
  return data;
}
