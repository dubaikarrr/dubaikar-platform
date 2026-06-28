"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { importResume } from "@/lib/actions/resume-import";
import { Button } from "@/components/ui/button";

export function ImportResume() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const r = await importResume(fd);
      if (r.ok && r.id) {
        router.push(`/app/resume/${r.id}`);
      } else {
        setError(r.error ?? "Import failed.");
      }
    });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {pending ? "Importing…" : "Import resume"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,.txt"
        hidden
        onChange={onFile}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
