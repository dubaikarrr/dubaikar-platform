import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getResume } from "@/lib/actions/resume";
import { ResumeBuilder } from "@/components/tools/resume/resume-builder";

export const metadata: Metadata = { title: "Resume editor" };

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/app/resume"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> All resumes
      </Link>
      <ResumeBuilder resume={resume} />
    </div>
  );
}
