import { createElement } from "react";
import type { ResumeData } from "@/lib/database.types";
import { ResumeDocument } from "@/components/tools/resume/templates";
import { RESUME_CSS } from "@/lib/resume/resume-css";

const FONTS_LINK =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&family=Lora:wght@400;500;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;500;700&display=swap";

/** Full self-contained HTML document for the PDF, same template + CSS as the app preview. */
export async function renderResumeHtml(data: ResumeData): Promise<string> {
  // Dynamic import keeps react-dom/server out of the static app graph (Next 16 guardrail).
  const { renderToStaticMarkup } = await import("react-dom/server");
  const body = renderToStaticMarkup(createElement(ResumeDocument, { data }));
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=794" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS_LINK}" rel="stylesheet" />
<style>
  :root {
    --font-inter: "Inter"; --font-roboto: "Roboto"; --font-open-sans: "Open Sans";
    --font-source-sans: "Source Sans 3"; --font-poppins: "Poppins";
    --font-montserrat: "Montserrat"; --font-space-grotesk: "Space Grotesk";
    --font-lora: "Lora"; --font-merriweather: "Merriweather"; --font-playfair: "Playfair Display";
  }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #fff; }
  @page { size: A4; margin: 0; }
  .cv-sheet { width: 210mm; box-shadow: none !important; }
  ${RESUME_CSS}
</style>
</head>
<body>${body}</body>
</html>`;
}
