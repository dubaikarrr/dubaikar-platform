-- Dubaikar — Phase 0/1 schema (SPEC §5).
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- RLS is enabled on every table; users can touch only their own rows.

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type stage as enum ('plan', 'prepare', 'apply', 'depart', 'arrive', 'settle');
create type primary_reason as enum ('employment', 'business', 'freelance', 'family');
create type lead_type as enum ('accommodation', 'visa', 'save_budget', 'setup', 'session');
create type lead_status as enum ('new', 'contacted', 'closed');

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — the hub. One row per user, id = auth.users.id.
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  current_stage stage not null default 'plan',
  target_move_date date,
  primary_reason primary_reason,
  industry text,
  experience_band text,
  education text,
  visa_status text,
  has_offer boolean not null default false,
  target_salary_aed integer,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Create an empty profile automatically when a user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- journey_steps — drives the roadmap + progress %.
-- ----------------------------------------------------------------------------
create table journey_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage stage not null,
  step_key text not null,
  label text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, step_key)
);

alter table journey_steps enable row level security;

create policy "journey_steps_all_own" on journey_steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index journey_steps_user_idx on journey_steps (user_id);

-- ----------------------------------------------------------------------------
-- resumes
-- ----------------------------------------------------------------------------
create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'My CV',
  data jsonb not null default '{}'::jsonb,
  template_key text not null default 'professional',
  ats_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table resumes enable row level security;

create policy "resumes_all_own" on resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index resumes_user_idx on resumes (user_id);

create trigger resumes_updated_at
  before update on resumes
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- budgets
-- ----------------------------------------------------------------------------
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  inputs jsonb not null default '{}'::jsonb,
  total_aed integer not null default 0,
  one_time_aed integer not null default 0,
  monthly_aed integer not null default 0,
  buffer_aed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table budgets enable row level security;

create policy "budgets_all_own" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index budgets_user_idx on budgets (user_id);

create trigger budgets_updated_at
  before update on budgets
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- leads — routed to the team. user_id nullable so public tools can capture too.
-- ----------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  type lead_type not null,
  payload jsonb not null default '{}'::jsonb,
  status lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leads enable row level security;

-- A user can create and read their own leads. Status changes / team triage
-- happen with the service-role key (bypasses RLS) from server code.
create policy "leads_insert_own" on leads
  for insert with check (auth.uid() = user_id);
create policy "leads_select_own" on leads
  for select using (auth.uid() = user_id);

create index leads_user_idx on leads (user_id);

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Storage: private buckets for resumes and documents. Access via signed URLs.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false), ('documents', 'documents', false)
on conflict (id) do nothing;

-- Owner-only access: files live under a folder named after the user's id.
create policy "resumes_storage_own" on storage.objects
  for all to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents_storage_own" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
