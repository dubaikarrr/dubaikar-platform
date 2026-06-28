"use server";

import { revalidatePath } from "next/cache";
import { extractText, getDocumentProxy } from "unpdf";
import { createClient } from "@/lib/supabase/server";
import { heuristicResume, aiStructureResume } from "@/lib/tools/resume-import";

export interface ImportResult {
  ok: boolean;
  id?: string;
  error?: string;
  aiUsed?: boolean;
}

/** Upload an existing resume (PDF or TXT) → create a prefilled resume. */
export async function importResume(formData: FormData): Promise<ImportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "File is too large (max 8 MB)." };
  }

  // Extract text.
  let text = "";
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocumentProxy(buf);
      const res = await extractText(pdf, { mergePages: true });
      text = Array.isArray(res.text) ? res.text.join("\n") : res.text;
    } else {
      text = await file.text();
    }
  } catch {
    return { ok: false, error: "Couldn't read that file. Try a text-based PDF." };
  }

  if (text.trim().length < 30) {
    return {
      ok: false,
      error: "No readable text found (scanned/image PDFs aren't supported yet).",
    };
  }

  // Structure with AI if available, else heuristic prefill.
  const ai = await aiStructureResume(text);
  const data = ai ?? heuristicResume(text);
  const title = file.name.replace(/\.(pdf|txt)$/i, "").slice(0, 60) || "Imported resume";

  const { data: created, error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title, data, template_key: data.style?.template ?? "professional" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/resume");
  return { ok: true, id: (created as { id: string }).id, aiUsed: Boolean(ai) };
}
