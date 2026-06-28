"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/lib/database.types";
import { ResumeDocument } from "@/components/tools/resume/templates";
import { RESUME_CSS } from "@/lib/resume/resume-css";

const SHEET_WIDTH = 794; // A4 @ 96dpi
const PAD = 16;

/**
 * Live preview: renders the selected template at A4 width and scales it to fit
 * the pane (both width AND height) so the whole page is visible without an
 * inner scrollbar. Uses transform (offsetHeight stays natural → no RO loop).
 */
export function ResumePreview({ data, injectCss = true }: { data: ResumeData; injectCss?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const recompute = () => {
      const w = wrapRef.current;
      const sheet = sheetRef.current;
      if (!w || !sheet) return;
      const availW = w.clientWidth - PAD;
      const availH = w.clientHeight - PAD;
      const natH = sheet.offsetHeight || 1123; // natural (pre-transform) height
      const widthScale = availW / SHEET_WIDTH;
      // If the pane has a real height, fit both dimensions so the page is fully visible.
      const s = availH > 300 ? Math.min(widthScale, availH / natH) : widthScale;
      setScale(Math.max(0.2, Math.min(1, s)));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrap);
    if (sheetRef.current) ro.observe(sheetRef.current);
    return () => ro.disconnect();
  }, [data]);

  return (
    <div ref={wrapRef} className="flex h-full w-full justify-center overflow-hidden">
      {injectCss ? <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} /> : null}
      <div
        ref={sheetRef}
        style={{
          width: SHEET_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          alignSelf: "flex-start",
        }}
      >
        <ResumeDocument data={data} />
      </div>
    </div>
  );
}
