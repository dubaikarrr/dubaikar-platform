# Dubaikar — UI design brief & prompt

Paste the **PROMPT** section below into your design tool (Claude, v0, etc.). The
rest is reference you can attach or trim.

---

## PROMPT (copy this)

> You are a senior product designer. Design the UI for **Dubaikar**, a login-based web app that guides Indian professionals through the entire journey of moving to and settling in Dubai (plan → prepare → apply → depart → arrive → settle). It is invite-only (Google sign-in). The flagship feature is an advanced **resume builder**. Tools are free; the brand is trustworthy, modern, and finance-grade (founders are Chartered Accountants).
>
> **Deliverables — for EVERY screen below, produce 4 frames:**
> 1. Desktop · Light
> 2. Desktop · Dark
> 3. Mobile · Light
> 4. Mobile · Dark
>
> Use the exact design tokens provided (colors, fonts, radii). Keep it clean, lots of whitespace, AA contrast in both modes, sentence case, two font weights (400/500). Desktop has a persistent left sidebar; mobile collapses to a bottom tab bar (Dashboard, Jobs, Resume, Community) with the rest behind a menu. A stage-progress pill stays visible in the top bar on every authed screen.
>
> Design the screens listed in "SCREENS TO DESIGN," reflecting the features in "FEATURE LIST." Make the **resume builder** the most polished screen — it must look better than competitor CA Monk: a two-pane editor (left = sections, right = live preview) with drag-to-reorder sections, rich-text editing, an ATS score ring, template gallery, and a customize panel.
>
> Output a cohesive design system first (color styles, type scale, components: buttons, inputs, cards, badges/pills, tabs, progress bar, stage strip, nav, avatar, empty state, modal), then the screens.

---

## BRAND & DESIGN TOKENS

**Colors**
- Brand accent (primary CTAs, active, progress): `#FF6B35` (orange)
- Brand ink (deep navy, headings/dark surfaces): `#1A1D3E`
- Light mode: page `#F7F8FA`, surface/cards `#FFFFFF`, muted fill `#F0F2F5`, text `#1F2233`, muted text `#5B5F73`, subtle `#8A8EA0`, border `rgba(26,29,62,0.10)`
- Dark mode: page `#0E1020`, surface `#1A1D33`, muted fill `#23263F`, text `#ECEEFC`, muted `#A7ABC4`, subtle `#7C809C`, border `rgba(255,255,255,0.10)`
- Semantic: success `#16A34A`, info `#2563EB`, warning `#D97706`, danger `#DC2626`
- Accent options for resumes (12): navy, orange, blue, sky, teal, green, violet, purple, pink, red, amber, slate

**Type**: Inter (sans). Headings weight 500 (h1 22, h2 18, h3 16); body 16/1.6; weights 400 & 500 only; sentence case everywhere.

**Radius**: controls 8px, cards 12px, large 16px. Subtle borders (0.5–1px, low alpha).

**Logo/wordmark**: "Dubai" in brand orange + "kar" in ink.

**Tone**: confident, practical, warm. Indian-professional-to-Dubai context (AED + ₹, visa, Emirates ID). Not flashy.

---

## FEATURE LIST (what the product does)

**Access**
- Invite-only Google sign-in (no public signup, no passwords).
- Personalized onboarding quiz (reason to move, education, experience, industry, has-offer, target move date, target salary).

**Dashboard (the hub)**
- Greeting + current journey stage.
- 6-stage StageStrip (plan/prepare/apply/depart/arrive/settle) with done/current/upcoming + overall progress %.
- "Your next steps" — context-aware tasks linking into modules.
- Quick-tool grid; session/community banner (book a 1:1, join WhatsApp).
- Metric cards (CVs, applications, target salary).

**Resume builder (FLAGSHIP — design richest)**
- Multiple named resumes (create, rename, duplicate, delete) shown as cards with ATS score.
- Two-pane editor: left = editable sections, right = live preview.
- Sections: Personal (with photo upload + round/rect/square), Summary, Work experience, Education, Skills + soft skills, Projects, Certifications, Awards, Languages (with proficiency), References (on-request/custom/hidden), and custom sections.
- Each section: drag-to-reorder, show/hide toggle, completion tick; overall **completion %**.
- Rich-text editor per entry (bold/italic/underline/bullets/numbered/links) with an "✨ Improve with AI" button.
- Month/year date pickers + "currently working" toggle.
- **ATS score** out of 100 — circular score ring + category bars (personal, impact, formatting, content) + issue chips + fixes. Domain/specialization/experience-aware.
- **JD match**: paste a job description → match %, matched/missing keyword chips, one-click "add missing skills."
- **Templates**: gallery of 9+ (single + double column): Professional, Classic ATS, Minimalist, Accent Header, Clean, Fresher, Modern, Executive, Dark Sidebar.
- **Customize**: 12 accent colors, font family, line spacing, one-page mode.
- **Download**: true vector PDF (WYSIWYG, selectable text). 100% free (no credits — unlike CA Monk).
- **Cover letter** generator (from resume + company/role + JD).
- **Import** an existing PDF resume to pre-fill.
- UAE-specific throughout: visa status, nationality, notice period.

**Budget calculator**
- Tabs: Arrival / Housing / Food / Transport / Lifestyle; selectable option cards.
- Sticky total card: total AED + ₹ with one-time / monthly / buffer breakdown.
- Save to account; "Help me save" → routes a lead to the team.

**Other tools**
- Dubai Metro pass calculator (pay-per-ride vs 30/90-day).
- Job-offer evaluator (package, gratuity, red flags).

**Knowledge hub** — filterable guides (visa, budget, career), also a public blog.

**Services** — request help (visa, accommodation, company setup, 1:1 session) → leads.

**Settings** — edit profile, current stage, sign out.

**Coming soon (show as locked/teaser)** — Jobs feed + application tracker, Housing listings, Community feed + find-friends.

**Global**: light/dark toggle, search, notifications, avatar; loading skeletons; empty states with a CTA.

---

## SCREENS TO DESIGN (each in light+dark, desktop+mobile)

1. Marketing landing (public) — hero, free-tools grid, stage strip, CTA.
2. Sign-in (Google-only, invite-only note).
3. Onboarding quiz (multi-step).
4. Dashboard.
5. Resume list (cards).
6. **Resume editor** (two-pane: sections + live preview) — the hero screen.
7. Resume: ATS panel + JD match panel.
8. Resume: template gallery + customize panel.
9. Budget calculator (tabs + sticky total).
10. Metro calculator and Offer evaluator (compact tool layout).
11. Knowledge hub (filter + article cards) and an article page.
12. Services (request cards).
13. Settings.
14. Empty states + "coming soon" module.

Prioritize 4, 5, 6, 7, 8 (resume flow) and 9 (budget).
