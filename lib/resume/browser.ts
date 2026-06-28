import fs from "node:fs";
import type { Browser } from "puppeteer-core";

/** Common local Chrome/Edge install paths by platform. */
const LOCAL_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

function findLocalChrome(): string | undefined {
  for (const p of LOCAL_CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

/** Launch Chromium, local installed Chrome in dev, @sparticuz/chromium on serverless. */
export async function launchBrowser(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;
  const local = findLocalChrome();
  if (local) {
    return puppeteer.launch({
      executablePath: local,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }) as unknown as Promise<Browser>;
  }
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  }) as unknown as Promise<Browser>;
}
