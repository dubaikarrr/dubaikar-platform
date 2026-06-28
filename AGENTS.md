<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dubaikar — conventions

The source of truth for *what* to build is `SPEC.md`. This file captures *how*
it's built so context persists across sessions.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 (CSS-first: tokens in `app/globals.css` via `@theme inline`, no `tailwind.config`)
- Supabase (Postgres + Auth + Storage), `@supabase/ssr`
- Anthropic SDK for ATS scoring (server-side only)

## Structure
- `app/(marketing)/` — public, SSR: landing, `/blog`, `/tools/*`, `/privacy`
- `app/(auth)/` — `/login`, `/signup`
- `app/app/onboarding/` — focused onboarding (no shell)
- `app/app/(shell)/` — authed app under `AppShell` (dashboard at `/app`, plus resume, budget, knowledge, settings, services, and Phase 2/3 placeholders)
- `app/api/` — route handlers (`/api/ats-scan`)
- `app/auth/` — OAuth callback + signout route handlers
- `components/ui/` — design system primitives
- `components/shell/`, `components/tools/`, etc. — feature components
- `lib/` — supabase clients, currency, journey, content, server `actions/`, ported tool logic in `tools/`
- `content/blog/` — MDX posts (frontmatter: title, description, date, category)
- `supabase/migrations/` — SQL + RLS

## Patterns
- **Server Components by default.** Add `"use client"` only for interactivity.
- **Mutations are server actions** in `lib/actions/*` (or route handlers). They call `supabase.auth.getUser()` and rely on RLS; never trust client-supplied user ids.
- **Auth gating:** middleware redirects unauthed `/app/*` → `/login`. `lib/profile.ts` helpers (`requireUser`, `requireOnboardedProfile`) gate inside pages/layouts.
- **Currency:** always format through `lib/currency.ts` (single `AED_TO_INR`); round every displayed number.
- **Styling:** use token utilities (`bg-surface`, `text-muted`, `border-border`, `rounded-card`, `text-brand`). Compose classes with `cn()`. Support light + dark.
- **Ported tools** keep their constants/formulas faithful to `D:\Dubaikar\Website\index.html`; logic lives in `lib/tools/*`, UI in `components/tools/*`, shared between public preview and authed pages.
- **Secrets** (Anthropic key, service-role key) are server-only — never imported into client components.

## Verify
- `npm run dev` → app; `/styleguide` for the design system.
- `npx tsc --noEmit` and `npm run build` should pass before review.
- See `docs/SETUP.md` for Supabase/env setup.
