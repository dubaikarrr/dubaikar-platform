/**
 * One-off: remove em dashes (—, U+2014) from user-facing copy per founder rule.
 * Rules:
 *  A. Standalone placeholder em dash ("—" between quotes or as a lone JSX node)
 *     becomes a plain hyphen "-" (the conventional "no value" marker).
 *  B. Inline em dash between words becomes a comma.
 * En dashes (–) used for ranges are left untouched.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "content"];
const EXTS = new Set([".ts", ".tsx", ".mdx", ".md", ".css"]);
let filesChanged = 0;
let replacements = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXTS.has(extname(p))) processFile(p);
  }
}

function processFile(p) {
  const orig = readFileSync(p, "utf8");
  if (!orig.includes("—")) return;
  const before = (orig.match(/—/g) || []).length;

  let s = orig;
  // A. standalone placeholder em dash
  s = s.replace(/"—"/g, '"-"');
  s = s.replace(/>—</g, ">-<");
  s = s.replace(/'—'/g, "'-'");
  // B. inline em dash (spaces only, never across newlines) -> comma
  s = s.replace(/[ \t]*—[ \t]*/g, ", ");
  // cleanup artifacts from B
  s = s.replace(/,\s*,/g, ",");
  s = s.replace(/\(\s*,\s*/g, "(");

  const after = (s.match(/—/g) || []).length;
  if (s !== orig) {
    writeFileSync(p, s, "utf8");
    filesChanged++;
    replacements += before - after;
    console.log(`${p}: ${before} -> ${after}`);
  }
}

for (const r of ROOTS) {
  try { walk(r); } catch (e) { console.error(`skip ${r}: ${e.message}`); }
}
console.log(`\nDone. ${filesChanged} files changed, ${replacements} em dashes removed.`);
