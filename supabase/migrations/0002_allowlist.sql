-- Invite-only access. Only emails in this table may use the authed app.
-- Manage it in Supabase → Table Editor → allowed_emails (add/remove rows).
-- RLS is enabled with NO policies, so it's readable only via the service-role
-- key from server code (lib/auth/allowlist.ts) — never exposed to the browser.

create table allowed_emails (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

-- Store/compare lowercase to avoid case mismatches.
create or replace function lower_email()
returns trigger
language plpgsql
as $$
begin
  new.email = lower(trim(new.email));
  return new;
end;
$$;

create trigger allowed_emails_lower
  before insert or update on allowed_emails
  for each row execute function lower_email();

alter table allowed_emails enable row level security;
-- (No policies on purpose: only the service-role key can read this table.)

-- Seed your own admin email so you can get in immediately. Edit before running,
-- or add more rows later from the Table Editor.
-- insert into allowed_emails (email, note) values ('you@example.com', 'founder');
