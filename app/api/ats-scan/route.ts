import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { scoreResumeLocal, type AtsResult } from "@/lib/tools/ats";
import type { ResumeData } from "@/lib/database.types";

/**
 * ATS scan. The Anthropic key stays server-side here (the legacy site shipped
 * it to the browser). Falls back to the local rubric if the API is unavailable.
 */
export async function POST(request: NextRequest) {
  // Require an authenticated user.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: ResumeData;
  try {
    ({ data } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const local = scoreResumeLocal(data);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ result: local, source: "local" });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const prompt = `You are an expert Dubai/UAE ATS resume scorer. Analyze this CV for the Dubai job market. Return ONLY valid JSON (no markdown, no backticks).

CV DATA:
${JSON.stringify(data, null, 1)}

Return EXACTLY this JSON structure:
{"score":0-100,"label":"ATS ready/Needs improvement/Needs work","categories":{"personal":0-100,"impact":0-100,"formatting":0-100,"content":0-100},"issues":[{"type":"good|bad|warn","msg":"text","section":"personal|experience|education|skills"}],"improvements":[{"type":"Add metrics","before":"original bullet","after":"improved bullet with numbers"}],"missingKeywords":["keyword"],"tips":["actionable tip"]}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const ai = JSON.parse(text) as AtsResult;
    return NextResponse.json({ result: ai, source: "ai" });
  } catch (err) {
    console.error("ATS AI scan failed, using local fallback:", err);
    return NextResponse.json({ result: local, source: "local" });
  }
}
