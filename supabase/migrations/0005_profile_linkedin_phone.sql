-- Dubaikar — add LinkedIn URL to profiles + member_directory.
-- Phone is already on profiles (set during onboarding).
-- Run in the Supabase SQL editor after 0001..0004.

alter table profiles add column if not exists linkedin_url text;

-- member_directory exposes safe public fields to other authed users. Add
-- linkedin_url so we can show a LinkedIn link on community posts without
-- exposing the rest of the profile.
drop view if exists member_directory;
create view member_directory as
  select id, full_name, avatar_url, current_stage, industry, target_move_date, linkedin_url
  from profiles
  where onboarded = true;
revoke all on member_directory from anon;
grant select on member_directory to authenticated;
