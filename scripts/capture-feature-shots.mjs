/**
 * One-off: capture screenshots of the live app pages for the homepage
 * "What you get with Dubaikar" section. Requires the dev server to be running
 * with DEV_BYPASS_AUTH=1 (so /app/* renders without sign-in).
 *
 * Usage:
 *   node scripts/capture-feature-shots.mjs
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

function findChrome() {
  for (const p of LOCAL_CHROME_CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error("No local Chrome/Edge found. Install Chrome or set PUPPETEER_EXECUTABLE_PATH.");
}

const TARGETS = [
  { path: "/app/budget",  file: "budget.png",        waitFor: "h1" },
  { path: "/app/resume",  file: "resume.png",        waitFor: "h1" },
  { path: "/app/map",     file: "explore-dubai.png", waitFor: "h1", extraWaitMs: 4500 },
  { path: "/app/housing", file: "housing.png",       waitFor: "h1" },
  { path: "/app/knowledge", file: "knowledge.png",   waitFor: "h1" },
];

const BASE = "http://localhost:5000";
const OUT_DIR = path.resolve("public/images");

// Hide Next.js dev indicators, scrollbars, the floating "N" preview chip, etc.
const SCREENSHOT_CSS = `
  /* Hide Next.js dev/build indicators and any floating dev overlay */
  #__next-build-watcher,
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  [data-next-mark],
  div[style*="z-index: 9999"][style*="position: fixed"]:has(svg),
  div[class*="dev"] { display: none !important; }
  /* The floating "N" chip we saw in screenshots */
  a[href*="/builder"], [data-nextjs-router-tree-button] { display: none !important; }
  /* Hide scrollbar tracks for cleaner shots */
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
  html, body { overflow: hidden !important; }
`;

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
  });

  try {
    for (const t of TARGETS) {
      const url = BASE + t.path;
      console.log(`-> ${t.path} -> ${t.file}`);
      const page = await browser.newPage();
      try {
        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        try { await page.waitForSelector(t.waitFor, { timeout: 8000 }); } catch {}
        // Inject hiding CSS
        await page.addStyleTag({ content: SCREENSHOT_CSS });
        // Force light theme (in case dark)
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "light");
        });
        if (t.extraWaitMs) await new Promise((r) => setTimeout(r, t.extraWaitMs));
        // Give web fonts + animations a beat to settle
        await new Promise((r) => setTimeout(r, 800));

        const outPath = path.join(OUT_DIR, t.file);
        await page.screenshot({
          path: outPath,
          type: "png",
          clip: { x: 0, y: 0, width: 1440, height: 900 },
        });
        const size = fs.statSync(outPath).size;
        console.log(`   wrote ${outPath} (${Math.round(size / 1024)} KB)`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log("done.");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
