-- Dubaikar — webinar registrations + Razorpay payments.
-- Run in the Supabase SQL editor after 0001 + 0002 + 0003.
-- RLS is enabled with NO public policy: all reads/writes go through service-role
-- API routes (app/api/webinar/*), so anonymous clients can never touch this table.

create table webinar_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text,
  profession text,
  experience text,
  amount_inr integer not null,
  currency text not null default 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table webinar_registrations enable row level security;
-- No policies on purpose — only the service role (which bypasses RLS) may access.

create trigger webinar_registrations_updated_at before update on webinar_registrations
  for each row execute function set_updated_at();

create index webinar_registrations_status_idx on webinar_registrations (status, created_at desc);
create index webinar_registrations_order_idx on webinar_registrations (razorpay_order_id);
