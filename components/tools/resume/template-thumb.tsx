"use client";

import type { ResumeData } from "@/lib/database.types";
import { ResumeDocument } from "@/components/tools/resume/templates";

const SHEET_WIDTH = 794;

/** Scaled-down render of a template in its SIGNATURE theme (varied gallery). */
export function TemplateThumb({
  data,
  templateKey,
  width = 220,
}: {
  data: ResumeData;
  templateKey: string;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        height: width * 1.414,
        overflow: "hidden",
        borderRadius: 6,
        border: "1px solid #e6e8ee",
        background: "#fff",
        pointerEvents: "none",
      }}
    >
      <div style={{ width: SHEET_WIDTH, transform: `scale(${width / SHEET_WIDTH})`, transformOrigin: "top left" }}>
        <ResumeDocument data={data} styleOverride={{ template: templateKey } as ResumeData["style"]} />
      </div>
    </div>
  );
}
