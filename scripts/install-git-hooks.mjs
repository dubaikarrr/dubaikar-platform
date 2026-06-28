#!/usr/bin/env node
/**
 * Installs local git hooks. Each developer runs `node scripts/install-git-hooks.mjs`
 * once after cloning. The hooks live in this folder so they're version-controlled
 * and changes ship with the code; git's actual .git/hooks dir is not committed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const srcDir = path.join(root, "scripts", "git-hooks");
const dstDir = path.join(root, ".git", "hooks");

if (!fs.existsSync(path.join(root, ".git"))) {
  console.error("Not a git checkout. Run this from the project root.");
  process.exit(1);
}
if (!fs.existsSync(srcDir)) {
  console.error("scripts/git-hooks not found.");
  process.exit(1);
}

for (const name of fs.readdirSync(srcDir)) {
  const src = path.join(srcDir, name);
  const dst = path.join(dstDir, name);
  fs.copyFileSync(src, dst);
  try {
    fs.chmodSync(dst, 0o755);
  } catch {
    // Windows ignores chmod, that's fine.
  }
  console.log(`installed: .git/hooks/${name}`);
}
