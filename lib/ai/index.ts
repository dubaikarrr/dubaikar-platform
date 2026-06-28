import { groqEnabled, groqText } from "@/lib/ai/groq";
import { aiEnabled as geminiEnabled, generateText as geminiText } from "@/lib/ai/gemini";

/** AI is on if any provider has a key and AI_ENABLED isn't false. */
export function aiEnabled(): boolean {
  return groqEnabled() || geminiEnabled();
}

/** Generate text via the first available provider (Groq → Gemini). */
export async function generateText(
  prompt: string,
  opts: { json?: boolean; system?: string } = {},
): Promise<string | null> {
  if (groqEnabled()) return groqText(prompt, opts);
  if (geminiEnabled()) return geminiText(prompt);
  return null;
}

/** Generate JSON via the first available provider; parses and returns it. */
export async function generateJson<T>(
  prompt: string,
  system?: string,
): Promise<T | null> {
  const text = await generateText(prompt, { json: true, system });
  if (!text) return null;
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
  } catch {
    return null;
  }
}
