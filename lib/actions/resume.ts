"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Resume, ResumeData } from "@/lib/database.types";
import { emptyResumeData, normalizeResumeData } from "@/lib/tools/resume-templates";

export { emptyResumeData };

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** All of the current user's resumes, newest first. */
export async function listResumes(): Promise<Resume[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  return (data as Resume[] | null) ?? [];
}

/** One resume by id, with its data normalized for the editor. */
export async function getResume(id: string): Promise<Resume | null> {
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  const resume = data as Resume;
  return { ...resume, data: normalizeResumeData(resume.data) };
}

/** Create a resume prefilled from the profile; returns the new id. */
export async function createResume(title = "Untitled resume"): Promise<string | null> {
  const { supabase, user } = await getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, industry, visa_status")
    .eq("id", user.id)
    .maybeSingle();

  const seeded = emptyResumeData({
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    jobTitle: profile?.industry ?? "",
    visaStatus: profile?.visa_status ?? "",
  });

  const { data: created } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title, data: seeded, template_key: "professional" })
    .select("id")
    .single();

  revalidatePath("/app/resume");
  return (created as { id: string } | null)?.id ?? null;
}

export async function duplicateResume(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  const { data: src } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!src) return;
  const s = src as Resume;
  await supabase.from("resumes").insert({
    user_id: user.id,
    title: `${s.title} (copy)`,
    data: s.data,
    template_key: s.template_key,
    ats_score: s.ats_score,
  });
  revalidatePath("/app/resume");
}

export async function renameResume(id: string, title: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase
    .from("resumes")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/app/resume");
}

export async function deleteResume(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/resume");
}

/** Create a resume then redirect into its editor (for the "New resume" button). */
export async function createAndEditResume() {
  const id = await createResume();
  if (id) redirect(`/app/resume/${id}`);
}

/** Persist resume data + ATS score. Template lives in data.style.template. */
export async function saveResume(
  id: string,
  data: ResumeData,
  atsScore: number | null,
) {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("resumes")
    .update({
      data,
      template_key: data.style?.template ?? "professional",
      ats_score: atsScore,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("journey_steps")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("step_key", "prepare_cv");

  revalidatePath("/app");
  revalidatePath("/app/resume");
  return { ok: true };
}
