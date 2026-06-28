# Working on Dubaikar with someone else

Two-person workflow for `dubaikar-platform`. Read once, refer back when stuck.

## One-time setup (new machine)

```powershell
# 1. Clone
git clone https://github.com/dubaikarrr/dubaikar-platform.git
cd dubaikar-platform

# 2. Install deps (the `prepare` script auto-installs the local git hook)
npm install

# 3. Drop the .env.local file into the project root
#    (Get it from the other founder via a password manager — never email/WhatsApp it.)

# 4. Run locally
npm run dev   # serves on http://localhost:5000
```

The `npm install` step also installs a `pre-push` git hook that blocks
direct pushes to `main` (see `scripts/git-hooks/pre-push`). This catches
accidents, it does not stop a determined override.

## Daily workflow

Every change, no exceptions:

```powershell
# 1. Start from latest main
git checkout main
git pull

# 2. Branch for the change
git checkout -b feat/<short-name>           # or fix/, copy/, chore/

# 3. Edit, commit
git add .
git commit -m "Add LinkedIn link to community posts"

# 4. Push the branch
git push -u origin feat/<short-name>
```

Then on GitHub:

5. Open the repo, click the **Compare & pull request** banner.
6. Brief description of what changed and why.
7. Vercel will comment a **preview URL** on the PR within ~60 sec. Click it.
8. The other person reviews the diff, approves, merges.
9. Vercel auto-deploys `main` to `dubaikar.com` within ~60 sec.

## Rules to avoid stepping on each other

- **Always start from latest `main`** (`git pull` first).
- **One change = one branch = one PR.** Don't bundle unrelated edits.
- **Pre-push hook blocks pushing to `main`** locally. If you really need to
  bypass once (emergency rollback), use `git push --no-verify` and tell the
  other person what you did.
- **Coordinate big changes** in WhatsApp first ("I'm rewriting the resume
  editor today, hold off on it").
- **Small UI / copy fixes** don't need pre-coordination — just push and PR.
- **Don't both edit Vercel env vars at the same time** — one person at a time.
- **Don't both run Supabase migrations** at the same time — coordinate, and
  always commit the migration SQL to `supabase/migrations/` so it's tracked.

## Resolving merge conflicts

When GitHub says "this branch has conflicts":

```powershell
git checkout my-branch
git pull origin main
# Open the files with <<<<<<< markers, pick the lines to keep, save
git add .
git commit -m "Resolve merge conflict with main"
git push
```

## Useful one-liners

```powershell
# See what branches exist on the remote
git fetch --prune
git branch -r

# Delete a local branch that's already merged
git branch -d feat/old-thing

# Delete the same branch on the remote (after PR merged)
git push origin --delete feat/old-thing

# Re-install the pre-push hook (it lives in .git/hooks which isn't committed)
node scripts/install-git-hooks.mjs
```

## Where things live

| Path | What |
| --- | --- |
| `app/(marketing)/` | Public, SSR'd marketing pages. |
| `app/app/(shell)/` | Authed app pages, behind the topbar+sidebar layout. |
| `app/app/admin/` | Founder-only admin pages (gated by `lib/auth/admin.ts`). |
| `app/api/` | API routes (webinar Razorpay, ATS, PDF). |
| `components/` | Shared React components, grouped by feature. |
| `lib/actions/` | Server Actions (auth-gated DB writes). |
| `lib/auth/` | Allowlist + admin gating helpers. |
| `lib/tools/` | Tool logic (budget, metro, ATS, JD-match). |
| `lib/map/` | Curated Dubai map data. |
| `public/home.html` | The 2 MB static homepage served at `/`. |
| `supabase/migrations/` | DB schema, applied in order. |
| `content/blog/` | MDX knowledge base. |
| `docs/SETUP.md` | First-time env / Supabase / Razorpay / MapTiler setup. |

## Conventions

- **No em dashes** in any user-facing copy, ever. Use commas, periods, or hyphens.
- **Brand orange** `#FF6B35`, **ink navy** `#1A1D3E`. Use CSS vars, not literals.
- **AED to INR conversion**: always via `lib/currency.ts` (one constant, one rounder).
- **Server-only secrets** (Supabase service-role, Anthropic, Groq, Razorpay): never
  imported into a `"use client"` file, never read in Server Components that are
  imported by clients. Check before importing.
