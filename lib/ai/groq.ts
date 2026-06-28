/** Groq provider (free, fast, OpenAI-compatible). */
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export function groqEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY) && process.env.AI_ENABLED !== "false";
}

export async function groqText(
  prompt: string,
  opts: { json?: boolean; system?: string } = {},
): Promise<string | null> {
  if (!groqEnabled()) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          opts.system ? { role: "system", content: opts.system } : null,
          { role: "user", content: prompt },
        ].filter(Boolean),
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Groq error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("Groq request failed:", err);
    return null;
  }
}
