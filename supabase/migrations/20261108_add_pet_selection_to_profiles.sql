-- ==============================================================================
-- NOWLY: Add Pet Selection to User Profiles
-- Safe, additive, repeatable, and idempotent migration script for Supabase.
-- ==============================================================================

-- 1. Add selected_pet_id and pet_selected_at columns to public.profiles
alter table public.profiles
  add column if not exists selected_pet_id text,
  add column if not exists pet_selected_at timestamp with time zone;

-- 2. Create index on selected_pet_id for performant queries
create index if not exists idx_profiles_selected_pet_id on public.profiles(selected_pet_id);

-- 3. Update comments for schema documentation
comment on column public.profiles.selected_pet_id is 'Identifier of the companion pet selected by the user (e.g. husky, lunar_fox, etc.)';
comment on column public.profiles.pet_selected_at is 'UTC timestamp when the user confirmed or updated their selected companion pet';

