import { GoogleGenerativeAI } from "@google/generative-ai";

/** Free AI provider (Gemini). Dormant until GEMINI_API_KEY is set. */
export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY) && process.env.AI_ENABLED !== "false";
}

const MODEL = "gemini-2.0-flash";

/** Run a prompt and return plain text, or null if AI is unavailable/errors. */
export async function generateText(prompt: string): Promise<string | null> {
  if (!aiEnabled()) return null;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (err) {
    console.error("Gemini generateText failed:", err);
    return null;
  }
}

/** Run a prompt expecting JSON; parses and returns it, or null. */
export async function generateJson<T>(prompt: string): Promise<T | null> {
  const text = await generateText(prompt);
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
