"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Download, Trash2, Check } from "lucide-react";
import { updateAvatar, exportMyData } from "@/lib/actions/profile";
import { createLead } from "@/lib/actions/leads";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

function resizeToDataUrl(file: File, max = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AccountSection({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [deleteSent, setDeleteSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeToDataUrl(file);
    setAvatar(dataUrl);
    startTransition(async () => {
      const r = await updateAvatar(dataUrl);
      setStatus(r.ok ? "Photo updated." : r.error ?? "Failed.");
    });
    e.target.value = "";
  }

  function onExport() {
    startTransition(async () => {
      const json = await exportMyData();
      if (!json) return setStatus("Export failed.");
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dubaikar-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function onDeleteRequest() {
    if (!confirm("Request account deletion? The team will confirm by email before removing anything.")) return;
    startTransition(async () => {
      const r = await createLead("setup", { action: "delete_account" });
      if (r.ok) setDeleteSent(true);
      else setStatus(r.error ?? "Failed to send request.");
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Account</CardTitle></CardHeader>
      <CardBody className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar name={name} src={avatar} size={56} />
          <div className="space-x-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
              <Upload className="h-4 w-4" /> {avatar ? "Change photo" : "Upload photo"}
            </Button>
            {avatar ? (
              <Button variant="ghost" size="sm" disabled={pending}
                onClick={() => { setAvatar(null); startTransition(() => updateAvatar(null).then(() => {})); }}>
                Remove
              </Button>
            ) : null}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
        </div>
        <p className="text-xs text-text-subtle">Your photo shows in the top bar and on your community posts.</p>

        {/* Export + delete */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="secondary" size="sm" onClick={onExport} disabled={pending}>
            <Download className="h-4 w-4" /> Download my data (JSON)
          </Button>
          {deleteSent ? (
            <span className="flex items-center gap-1.5 text-sm text-success"><Check className="h-4 w-4" /> Deletion request sent</span>
          ) : (
            <Button variant="ghost" size="sm" className="text-danger" onClick={onDeleteRequest} disabled={pending}>
              <Trash2 className="h-4 w-4" /> Request account deletion
            </Button>
          )}
        </div>
        {status ? <p className="text-xs text-text-muted">{status}</p> : null}
      </CardBody>
    </Card>
  );
}
