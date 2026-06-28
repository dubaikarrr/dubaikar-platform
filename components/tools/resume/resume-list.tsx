"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Pencil, Trash2, FileText } from "lucide-react";
import type { Resume } from "@/lib/database.types";
import { duplicateResume, renameResume, deleteResume } from "@/lib/actions/resume";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function ResumeList({ resumes }: { resumes: Resume[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((r) => (
        <ResumeCard key={r.id} resume={r} />
      ))}
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const [pending, startTransition] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(resume.title);

  const updated = new Date(resume.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col p-4">
      <Link href={`/app/resume/${resume.id}`} className="flex-1">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand">
            <FileText className="h-5 w-5" />
          </span>
          {resume.ats_score != null ? (
            <Badge tone={resume.ats_score >= 75 ? "success" : resume.ats_score >= 50 ? "warning" : "danger"}>
              ATS {resume.ats_score}
            </Badge>
          ) : (
            <Badge>Not scored</Badge>
          )}
        </div>
        {renaming ? (
          <Input
            className="mt-3"
            value={title}
            autoFocus
            onClick={(e) => e.preventDefault()}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setRenaming(false);
                startTransition(() => renameResume(resume.id, title.trim() || "Untitled"));
              }
            }}
          />
        ) : (
          <p className="mt-3 truncate font-medium text-text">{resume.title}</p>
        )}
        <p className="text-xs text-text-subtle capitalize">
          {resume.template_key} · updated {updated}
        </p>
      </Link>

      <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (renaming) {
              setRenaming(false);
              startTransition(() => renameResume(resume.id, title.trim() || "Untitled"));
            } else {
              setRenaming(true);
            }
          }}
        >
          <Pencil className="h-4 w-4" /> {renaming ? "Save" : "Rename"}
        </Button>
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(() => duplicateResume(resume.id))}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${resume.title}"? This can't be undone.`)) {
              startTransition(() => deleteResume(resume.id));
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
