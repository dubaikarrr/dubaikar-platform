import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listResumes, createAndEditResume } from "@/lib/actions/resume";
import { ResumeList } from "@/components/tools/resume/resume-list";
import { ImportResume } from "@/components/tools/resume/import-resume";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Resumes" };

export default async function ResumeListPage() {
  const resumes = await listResumes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text">Your resumes</h1>
          <p className="text-sm text-text-muted">
            Build Dubai-ready CVs, score them, and download polished PDFs.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <ImportResume />
          <form action={createAndEditResume}>
            <Button type="submit">
              <Plus className="h-4 w-4" /> New resume
            </Button>
          </form>
        </div>
      </div>

      {resumes.length === 0 ? (
        <form action={createAndEditResume}>
          <EmptyState
            icon={<Plus className="h-5 w-5" />}
            title="No resumes yet"
            description="Create your first Dubai-ready CV in minutes."
            action={<Button type="submit">Create a resume</Button>}
          />
        </form>
      ) : (
        <ResumeList resumes={resumes} />
      )}
    </div>
  );
}
