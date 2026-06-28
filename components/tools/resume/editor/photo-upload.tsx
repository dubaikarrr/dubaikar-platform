"use client";

import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import type { PhotoShape } from "@/lib/database.types";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  photo?: string;
  shape?: PhotoShape;
  onChange: (photo: string | undefined, shape?: PhotoShape) => void;
}

const SHAPES: PhotoShape[] = ["round", "rect", "square"];

/** Resize an image file to ~400px max and return a base64 JPEG data URL. */
function resizeToDataUrl(file: File, max = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({ photo, shape = "round", onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeToDataUrl(file);
    onChange(dataUrl, shape);
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-surface-2 text-text-subtle"
        style={{ borderRadius: shape === "round" ? "9999px" : shape === "square" ? "0" : "8px" }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </span>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-2"
          >
            {photo ? "Replace photo" : "Upload photo"}
          </button>
          {photo ? (
            <button
              type="button"
              onClick={() => onChange(undefined, shape)}
              className="flex items-center gap-1 rounded-[var(--radius-control)] px-2 py-1.5 text-sm text-danger hover:bg-surface-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-1">
          {SHAPES.map((sh) => (
            <button
              key={sh}
              type="button"
              onClick={() => onChange(photo, sh)}
              className={cn(
                "rounded px-2 py-0.5 text-xs capitalize",
                shape === sh ? "bg-brand-soft text-brand" : "text-text-muted hover:bg-surface-2",
              )}
            >
              {sh}
            </button>
          ))}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
    </div>
  );
}
