# Dubaikar — Platform Build Spec

A handoff document for building the Dubaikar web app. Written to be dropped into a repo and used by Claude Code as the source of truth. Keep this as `SPEC.md` and create a short `CLAUDE.md` with running conventions as you build.

---

## 1. What we're building

Dubaikar today is a static marketing site with a few standalone tools (budget calculator, resume builder, metro pass calculator, job-offer evaluator) and an SEO blog. We are turning it into a **login-based web app**: a single, step-by-step platform that guides an Indian professional through the entire journey of moving to and settling in Dubai — plan, prepare, apply for jobs, depart, arrive, settle — with the existing tools, a community, and paid-service handoffs all tied to one account.

Founders are Chartered Accountants (Sanket & Shivam). Revenue model is unchanged: tools and content stay free; money comes from paid sessions (currently Topmate) and high-value service handoffs (visa, accommodation, and later company setup). Do not gate tools or content behind payment.

## 2. Product principles (these drive every decision)

- **The journey is the spine.** After login the home screen is a personalized roadmap of where the user is in their move — not a feature menu. Every feature attaches to a journey stage.
- **The profile is the hub.** One user profile sits under every feature. The budget tool, resume builder, and job tracker all read and write the same profile, so the dashboard always "knows" the user's stage, CV score, and target salary.
- **Free tools feed paid services.** Tools capture intent; intent becomes a lead routed to the team.
- **Never break SEO.** The marketing pages, blog, and public tool landing pages must be server-rendered and crawlable. They are the top of the funnel.
- **Personal data is sensitive.** Visa status, salary, and uploaded documents are private by default and protected with row-level security.

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Server-renders the blog/marketing for SEO and runs the dynamic app in one codebase; builds on the React already used in the resume builder |
| Styling | Tailwind CSS + CSS variables for tokens | Fast, consistent, supports the design system in section 7 |
| Backend / DB | Supabase (Postgres) | Relational data fits a journey of related records; one service for DB + auth + file storage + realtime |
| Auth | Supabase Auth — email, Google OAuth, phone OTP | Phone OTP matters for the Indian audience |
| File storage | Supabase Storage (private buckets) | Resume PDFs and uploaded documents |
| AI | Anthropic Claude API | Already used for ATS scoring; reuse for outreach generation and offer analysis |
| Hosting | Vercel | Pairs natively with Next.js |
| Payments (Phase 3) | Razorpay (India) + Stripe (international) | Only when monetizing directly; not needed for MVP |

Currency display: support AED and INR. Keep the conversion rate in one config constant (current site uses `1 AED = ₹25`). Round every displayed number.

## 4. Architecture & repo shape

Single Next.js app. Public routes are server-rendered; app routes are behind auth. Suggested structure:

```
/app
  /(marketing)        public, SSR: landing, blog, tool landing pages
  /(auth)             login, signup, onboarding
  /(app)              authed shell: dashboard, jobs, resume, budget, community, ...
/components           design system + shared UI
/lib                  supabase client, auth helpers, currency, claude api
/content              blog posts (MDX) migrated from the static site
/supabase             schema migrations + RLS policies
```

Migrate, don't rebuild: port the existing tools into React components, move blog posts into `/content` as MDX so rankings survive, and fold the resume builder (currently on `resume.dubaikar.com`) into `/(app)/resume`.

## 5. Data model

All tables use a `uuid` primary key and `created_at` / `updated_at` timestamps unless noted. Enable Row-Level Security on every table.

### Core (Phase 0–1)

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` (= auth.users.id), `full_name`, `email`, `phone`, `current_stage` (enum: plan, prepare, apply, depart, arrive, settle), `target_move_date`, `primary_reason` (enum: employment, business, freelance, family), `industry`, `experience_band`, `education`, `visa_status`, `has_offer` (bool), `target_salary_aed` | The hub. One row per user. |
| `journey_steps` | `user_id`, `stage`, `step_key`, `completed` (bool), `completed_at` | Drives the roadmap + progress %. Seed a default step set per stage. |
| `resumes` | `user_id`, `title`, `data` (jsonb), `template_key`, `ats_score` (int) | `data` holds all CV sections. |
| `budgets` | `user_id`, `inputs` (jsonb), `total_aed`, `one_time_aed`, `monthly_aed`, `buffer_aed` | Saved calculator runs. |
| `leads` | `user_id`, `type` (enum: accommodation, visa, save_budget, setup, session), `payload` (jsonb), `status` (enum: new, contacted, closed) | Routed to the team. |

### Phase 2–3

| Table | Key columns | Notes |
|---|---|---|
| `jobs` | `title`, `company`, `location`, `salary_min`, `salary_max`, `currency`, `visa_sponsored` (bool), `industry`, `experience_band`, `source_url`, `posted_at` | Curated listings (start curated, not scraped). |
| `applications` | `user_id`, `job_id`, `status` (enum: saved, applied, interview, offer, rejected), `notes`, `applied_at` | The job tracker. |
| `listings` | `posted_by`, `type`, `area`, `rent_aed`, `deposit_aed`, `description`, `contact`, `moderation_status` | Accommodation; requires moderation. |
| `connections` | `requester_id`, `receiver_id`, `status` (enum: pending, accepted, declined) | Find friends. |
| `community_posts` / `community_replies` | `user_id`, `body`, `category` / `post_id`, `user_id`, `body` | Community feed. |
| `resources` | `title`, `type`, `file_url`, `category` | The (currently empty) resource library. |

### RLS policy summary

- `profiles`, `journey_steps`, `resumes`, `budgets`, `applications`, `leads`, `connections`: a user can read/write **only their own rows**.
- `jobs`, `resources`: readable by any authenticated user; writable by admin only.
- `community_posts` / `community_replies`: readable by authenticated users; writable by the author.
- `listings`: readable when `moderation_status = approved`; writable by the author.
- Storage buckets for resumes/documents are **private**; access via signed URLs scoped to the owner.

## 6. Routes / information architecture

Public (SSR, crawlable): `/`, `/blog`, `/blog/[slug]`, `/tools/budget`, `/tools/resume`, `/tools/metro`, `/tools/offer-evaluator` (public landing/preview versions), `/login`, `/signup`.

Authed app (under the shell): `/app` (dashboard), `/app/jobs`, `/app/resume`, `/app/budget`, `/app/community`, `/app/knowledge`, `/app/housing`, `/app/services`, `/app/settings`. Onboarding lives at `/app/onboarding`.

Nav order in the sidebar: Dashboard, Jobs, Resume, Budget, Community (Knowledge, Housing, Services come later — show them but they can route to a simple placeholder until built).

## 7. Design system

Match the clickable wireframe that was approved. Low-to-mid fidelity is fine to start; apply the brand colors below.

### Tokens (define as CSS variables, support light + dark)

- Brand accent: `--brand: #FF6B35` (orange — primary CTAs, active states, progress fill).
- Brand ink: `--brand-ink: #1A1D3E` (deep navy — dark surfaces, top bar option, headings on light).
- Surfaces: `--bg` (page), `--surface` (cards, white in light / dark slate in dark), `--surface-2` (muted fills).
- Text: `--text` (primary), `--text-muted`, `--text-subtle`.
- Borders: subtle, `0.5px–1px`, low-alpha neutral.
- Semantic: success (green), info (blue), warning (amber), danger (red) — used for match scores, application status, alerts.
- Radius: `8px` (controls), `12px` (cards), `16px` (large). Corners only rounded on full borders.
- Typography: clean sans (Inter or system). Headings weight 500 (h1 22, h2 18, h3 16). Body 16px, line-height 1.6. Sentence case everywhere. Two weights only (400 / 500).

### Component inventory (build these first, in `/components`)

`AppShell` (TopBar + Sidebar + content slot), `TopBar` (brand, search, stage pill, notifications, avatar), `SidebarNav` + `NavItem`, `Card`, `MetricCard`, `Badge`/`Pill` (with success/info/warning/neutral variants), `Button` (primary = brand, secondary = outline), `ProgressBar`, `StageStrip` (the 6-stage progress row), `TaskRow`, `JobCard`, `ApplicationTracker`, `ResumeSectionList`, `ResumePreview`, `ATSBadge`, `SegmentedTabs`, `TotalCard`, `PostCard`, `PersonCard`, `EmptyState`, `Avatar`.

Every screen reuses these so new modules drop in without redesign. Keyboard-accessible, labelled, AA contrast in both modes.

### Responsive

Desktop: persistent left sidebar. Mobile: sidebar collapses to a bottom tab bar (Dashboard, Jobs, Resume, Community) with the rest behind a menu. The stage progress pill stays visible in the top bar on every screen.

## 8. Screen specs

Each screen below maps to the approved wireframe. For every screen handle three states: loading (skeletons), empty (EmptyState with a CTA), and populated.

### Onboarding (`/app/onboarding`)
First run after signup. A short multi-step quiz capturing the `profiles` fields: primary reason, education, experience band, whether they have an offer, target move date, industry, target salary. On submit, write the profile, seed `journey_steps`, set `current_stage`, and redirect to the dashboard. This is what makes everything else personalized.

### Dashboard (`/app`)
The hub. Greeting with the user's name and current stage. A `StageStrip` showing all six stages with done / current / upcoming states and a progress %. A "Your next steps" card with 2–3 context-aware `TaskRow`s (e.g. apply to saved jobs, get CV ATS-scored, register for the masterclass) that link into the relevant module. A quick-access grid of tool cards (Resume, Budget, Offer evaluator). A session/community banner (link to the Topmate session and WhatsApp channel). Data: reads `profiles`, `journey_steps`, counts from `applications` and `resumes`.

### Jobs (`/app/jobs`)
Filters: industry, experience, visa-sponsored. A list of `JobCard`s (title, company, location, salary range, match score badge, Save / Apply). A compact `ApplicationTracker` showing counts by status (Applied / Interview / Offer). Saving or applying writes an `applications` row. Start with curated `jobs` rows; match score can be a simple rule based on profile fields initially.

### Resume (`/app/resume`)
Two-pane: left = `ResumeSectionList` (Personal, Experience, Education, Skills with completion ticks) plus an `ATSBadge` (score out of 100); right = live `ResumePreview` with template selection. Buttons: Scan ATS (calls the Claude API), Download PDF. Persists to `resumes`. Port the existing builder's logic — it already has templates, UAE fields, JD matcher, and Claude-powered scoring.

### Budget (`/app/budget`)
`SegmentedTabs` for Arrival / Housing / Food / Transport / Lifestyle. Selectable option cards per tab (flight, visa, accommodation type, etc.). A sticky `TotalCard` showing total AED + INR with One-time / Monthly / Buffer breakdown. Save writes a `budgets` row; "Help me save" creates a `leads` row of type `save_budget`. Port the existing calculator's amounts and logic.

### Community (`/app/community`)
A feed of `PostCard`s (author, snippet, reply count). A side rail with the upcoming masterclass card and a "Find friends" panel of `PersonCard`s (suggested by overlapping move date / area, Connect button). Posting writes `community_posts`; Connect writes a `connections` row. This is a Phase 3 build — start it read-only or invite-only and add moderation + reporting before opening it up.

### Knowledge / Housing / Services (later)
Knowledge = the migrated blog/guides, filterable. Housing = accommodation `listings` + an interest form that creates a `leads` row. Services = the paid-service handoff (consultation request → `leads`). Until built, route to a simple placeholder.

## 9. Build phases — what to build, in order

Do not build everything at once. Ship the account + journey + existing tools first; that is most of the value.

**Phase 0 — Foundation.** Scaffold Next.js (App Router, TS, Tailwind). Build the design system and `AppShell` from section 7. Set up the Supabase project, auth (email + Google + phone OTP), the `profiles` and `journey_steps` tables with RLS. Build onboarding and an empty dashboard shell. Migrate the marketing site, blog (MDX, SSR), and port the existing tools as components. Outcome: a logged-in shell with everything we have today, nothing lost.

**Phase 1 — MVP (the "one-stop platform" v1).** Dashboard (journey + next steps + tools + session/community banner), Resume tied to the profile, Budget with save, Knowledge hub, lead capture. This is the launchable version.

**Phase 2 — Jobs, housing, leads.** Curated job feed + `ApplicationTracker`, recruiter directory, accommodation listings + interest form, structured lead routing.

**Phase 3 — Social, realtime, money.** Find friends (connections + matching), realtime community feed, payments (Razorpay/Stripe), affiliates/marketplace, and the business-setup module (free-zone vs mainland decision tool, setup cost calculator, corporate tax/VAT tools).

## 10. Non-functional requirements

- **Security:** RLS on every table (section 5). Private storage buckets with signed URLs. Never return another user's personal data.
- **SEO:** Server-render all `(marketing)` routes and the blog. Do not put public content behind auth.
- **Privacy:** Ship a privacy policy. Be explicit about what's stored (visa status, salary, documents). Minimize what's collected at onboarding.
- **Performance:** Lazy-load heavy modules (resume preview, charts). Skeleton loading states.
- **Accessibility:** Keyboard navigation, labelled controls, AA contrast, both color modes.
- **Numbers:** Round every displayed value; format currency with locale separators.

## 11. Out of scope for now

Realtime chat, payments, accommodation marketplace, find-friends matching, and the business-setup module are Phase 3 — leave them out of the MVP. Heavy user-generated and matching features need moderation and trust infrastructure and should not block launch.

## 12. How to use this with Claude Code

Drop this file in the repo root as `SPEC.md`. Then create a `CLAUDE.md` capturing conventions as they're decided (file structure, naming, component patterns) so context persists across sessions.

Suggested first prompt to Claude Code:

> Read `SPEC.md`. Scaffold a Next.js App Router + TypeScript + Tailwind project with Supabase. Do **Phase 0 only**: build the design system tokens and the `AppShell`, `Card`, `Button`, `Badge`, `NavItem`, `StageStrip`, and `ProgressBar` components from section 7 using the brand colors; configure Supabase auth (email, Google, phone OTP); create the `profiles` and `journey_steps` tables with the RLS policies from section 5; build the onboarding quiz and an empty dashboard shell wired to the profile. Do not build Phase 2 or 3 features. Show me the component library and the dashboard shell first.

Then proceed phase by phase, reviewing each before moving on.
