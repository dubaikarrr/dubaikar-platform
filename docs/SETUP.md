# Dubaikar — local setup

Steps you (the founder) run once. Everything else is in code.

## 1. Supabase project

1. Go to https://supabase.com → **New project**. Pick a region close to your users (e.g. Mumbai / Singapore). Save the database password.
2. **Project Settings → API** — copy into `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; keep secret)

## 2. Database schema

1. Open **SQL Editor** in Supabase.
2. Run [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) — tables, RLS, auto-profile trigger, storage buckets.
3. Run [`supabase/migrations/0002_allowlist.sql`](../supabase/migrations/0002_allowlist.sql) — the invite-only `allowed_emails` table.
4. Run [`supabase/migrations/0003_social.sql`](../supabase/migrations/0003_social.sql) — community, connections, notifications, bookmarks, avatars.
5. Run [`supabase/migrations/0004_webinar.sql`](../supabase/migrations/0004_webinar.sql) — `webinar_registrations` for the paid webinar (service-role only).

## 3. Auth — Google only, invite-only

Sign-in is **Google only** and **invite-only**: a Google account can use the app only if its email is in the `allowed_emails` table.

**Authentication → Providers → Google:** enable it, then add your OAuth client ID/secret from the Google Cloud console. Authorized redirect URL in Google Cloud: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.

**Authentication → URL Configuration:**
- Site URL: `http://localhost:5000` (and your production domain later).
- Redirect URLs: add `http://localhost:5000/auth/callback`.

**Grant access:** Supabase → **Table Editor → allowed_emails → Insert row**, add the email (lowercase is handled automatically). Add a row per person you want to let in. Delete a row to revoke access — it takes effect on their next request.

> Leave Supabase's "Allow new users to sign up" ON. First Google sign-in creates the auth user; our allowlist is what actually gates access, so non-listed accounts are signed out immediately. Email and phone sign-in are not used.

## 4. Anthropic key

Get a key from https://console.anthropic.com → `ANTHROPIC_API_KEY` in `.env.local`.
This stays server-side; it is only used by `/api/ats-scan`.

## 5. Run

```bash
npm run dev
```

Dubaikar runs on **port 5000** (Shricasa uses 3000 — keep them separate).

- App: http://localhost:5000
- Design system: http://localhost:5000/styleguide
- Sign up at http://localhost:5000/signup → you'll be sent to onboarding.

## Notes

- The legacy static site lives at `D:\Dubaikar\Website` — keep it running until this app is launched.
- Hosting target is Vercel; import the repo and set the same env vars in the Vercel dashboard.
