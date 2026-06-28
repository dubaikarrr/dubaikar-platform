/**
 * The ONE stylesheet for rendered resumes. Used by both the live preview
 * (injected as a <style>) and the server PDF (embedded in the print HTML).
 * Accent = --rc, secondary = --rc2; density vars --cv-pad/--cv-gap/--cv-fs.
 */
export const RESUME_CSS = `
.cv-sheet {
  --rc-soft: color-mix(in srgb, var(--rc) 12%, #ffffff);
  --rc-line: color-mix(in srgb, var(--rc) 35%, #ffffff);
  --rc2: var(--rc2, var(--rc));
  --rc2-soft: color-mix(in srgb, var(--rc2) 12%, #ffffff);
  --cv-padx: 32px;
  --cv-pady: 28px;
  --cv-gap: 15px;
  --cv-fs: 13px;
  width: 794px;
  background: #ffffff;
  color: #1f2328;
  font-size: var(--cv-fs);
  line-height: var(--cv-lh, 1.4);
  font-family: var(--cv-body, "Inter", system-ui, sans-serif);
}
.cv-sheet * { box-sizing: border-box; }
.cv-pad { padding: var(--cv-pady) var(--cv-padx); }
.cv-name, .cv-h2, .cv-entry-title { font-family: var(--cv-head, var(--cv-body, "Inter", sans-serif)); }

/* headers */
.cv-band { background: var(--rc); color: #fff; padding: 24px var(--cv-padx); display: flex; align-items: center; gap: 18px; }
.cv-band.cv-band-grad { background: linear-gradient(120deg, var(--rc), var(--rc2)); }
.cv-band .cv-name { color: #fff; }
.cv-band .cv-role { color: rgba(255,255,255,0.92); }
.cv-band .cv-contact, .cv-band .cv-uae { color: rgba(255,255,255,0.9); }
.cv-name { font-size: 25px; font-weight: 700; letter-spacing: -0.01em; color: #15181d; margin: 0; }
.cv-role { font-size: 12.5px; font-weight: 600; color: var(--rc); margin: 3px 0 0; }
.cv-center { text-align: center; }
.cv-contact { font-size: 10px; color: #5b5f66; margin-top: 7px; display: flex; flex-wrap: wrap; gap: 4px 12px; }
.cv-center .cv-contact { justify-content: center; }
.cv-uae { font-size: 9.5px; color: var(--rc); margin-top: 3px; }
.cv-center .cv-uae { text-align: center; }

/* section headings */
.cv-section { margin-bottom: var(--cv-gap); }
.cv-h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; margin: 0 0 8px; display: flex; align-items: center; gap: 7px; }
.cv-h2--underline { color: var(--rc); border-bottom: 2px solid var(--rc); padding-bottom: 3px; }
.cv-h2--bar { background: var(--rc); color: #fff; padding: 5px 10px; border-radius: 3px; letter-spacing: 0.07em; }
.cv-h2--rule { color: #15181d; border-bottom: 1px solid #d6d9de; padding-bottom: 4px; }
.cv-h2--side { color: var(--rc); letter-spacing: 0.07em; margin-bottom: 7px; }
.cv-h2--block { color: var(--rc); background: var(--rc-soft); padding: 5px 10px; border-radius: 4px; border-left: 3px solid var(--rc); }
.cv-side-light .cv-h2--side, .cv-side-light .cv-h2 { color: #fff; }
.cv-h2-ico { width: 14px; height: 14px; }

/* entries */
.cv-entry { margin-bottom: 10px; }
.cv-entry-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.cv-entry-title { font-weight: 700; color: #15181d; }
.cv-entry-sub { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; }
.cv-entry-org { color: var(--rc); font-weight: 600; }
.cv-meta { color: #6b7077; font-weight: 400; font-size: 10px; white-space: nowrap; }

/* rich text */
.cv-rt { margin-top: 4px; }
.cv-rt ul { margin: 3px 0; padding-left: 16px; list-style: disc; }
.cv-rt ol { margin: 3px 0; padding-left: 16px; list-style: decimal; }
.cv-rt li { margin-bottom: 2px; }
.cv-rt p { margin: 2px 0; }
.cv-rt a { color: var(--rc); }
.cv-rt strong { font-weight: 700; }
.cv-rt li::marker { color: var(--rc); }

/* chips */
.cv-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.cv-chip { font-size: 9.5px; font-weight: 600; padding: 3px 9px; border-radius: 4px; background: var(--rc-soft); color: var(--rc); }
.cv-side-light .cv-chip { background: rgba(255,255,255,0.18); color: #fff; }

/* languages */
.cv-langs { display: flex; flex-direction: column; gap: 6px; }
.cv-lang-top { display: flex; justify-content: space-between; font-size: 10px; }
.cv-lang-name { font-weight: 600; }
.cv-bar { height: 4px; border-radius: 3px; background: #e6e8ec; margin-top: 3px; overflow: hidden; }
.cv-bar > span { display: block; height: 100%; background: var(--rc); border-radius: 3px; }
.cv-side-light .cv-bar { background: rgba(255,255,255,0.22); }
.cv-side-light .cv-bar > span { background: #fff; }

/* education table */
.cv-edutable { width: 100%; border-collapse: collapse; font-size: 10.5px; }
.cv-edutable th { text-align: left; background: var(--rc-soft); color: var(--rc); font-weight: 700; padding: 5px 8px; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.04em; }
.cv-edutable td { padding: 5px 8px; border-bottom: 1px solid #eceef1; }

/* simple rows */
.cv-row { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; margin-bottom: 3px; }

/* timeline */
.cv-timeline { position: relative; padding-left: 18px; }
.cv-timeline::before { content: ""; position: absolute; left: 4px; top: 4px; bottom: 4px; width: 2px; background: var(--rc-line); }
.cv-tl-item { position: relative; margin-bottom: 11px; }
.cv-tl-item::before { content: ""; position: absolute; left: -18px; top: 4px; width: 9px; height: 9px; border-radius: 50%; background: var(--rc); box-shadow: 0 0 0 3px var(--rc-soft); }

/* sidebar layout */
.cv-split { display: flex; align-items: stretch; }
.cv-side { width: 250px; flex-shrink: 0; padding: 28px 22px; }
.cv-side-accent { background: var(--rc); color: #fff; }
.cv-side-dark { background: var(--rc2); color: #fff; }
.cv-side-grey { background: #f3f4f7; color: #1f2328; }
.cv-main { flex: 1; min-width: 0; padding: var(--cv-pady) var(--cv-padx); }
.cv-side .cv-name { font-size: 19px; }
.cv-side-light .cv-name, .cv-side-light .cv-role { color: #fff; }
.cv-side-block { margin-top: 16px; }
.cv-side-contact { display: flex; flex-direction: column; gap: 5px; font-size: 9.5px; word-break: break-word; }

/* photo */
.cv-photo { object-fit: cover; flex-shrink: 0; background: var(--rc-soft); }

/* serif */
.cv-serif .cv-name, .cv-serif .cv-h2, .cv-serif .cv-entry-title { font-family: var(--cv-head, Georgia, serif); }

/* dividers between sections */
.cv-div-line .cv-pad > .cv-section + .cv-section,
.cv-div-line .cv-main > .cv-section + .cv-section { border-top: 1px solid #ededf1; padding-top: 12px; }
.cv-div-dotted .cv-pad > .cv-section + .cv-section,
.cv-div-dotted .cv-main > .cv-section + .cv-section { border-top: 1px dotted #d4d7de; padding-top: 12px; }

@media print { .cv-sheet { width: 100%; } }
`;
