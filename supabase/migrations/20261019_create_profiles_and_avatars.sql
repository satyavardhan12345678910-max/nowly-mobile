-- ==============================================================================
-- NOWLY: User Profiles & Avatars Storage Migration
-- Safe, repeatable, and idempotent migration script for Supabase.
-- ==============================================================================

-- 1. Create public.profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 2. Drop existing policies if they already exist (ensures safe replayability)
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;

-- 3. Row Level Security Policies for public.profiles

-- Allow authenticated users to view profiles (for social features, search, circles)
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Allow authenticated users to update ONLY their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Allow authenticated users to delete ONLY their own profile
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using ((select auth.uid()) = id);

-- 4. Trigger for automatic updated_at timestamp management
create or replace function public.handle_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_profile_updated_at();

-- 5. Trigger for new user auto-provisioning
-- Automatically creates a profile record when a user registers (email or Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profile for any pre-existing auth.users who do not yet have a profile record
insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    ''
  ),
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    ''
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

-- ==============================================================================
-- STORAGE CONFIGURATION: "avatars" Bucket & Access Policies
-- ==============================================================================

-- 6. Create the public "avatars" bucket if it does not exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 7. Storage Policies on storage.objects
drop policy if exists "Avatar photos are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar photo" on storage.objects;
drop policy if exists "Users can update their own avatar photo" on storage.objects;
drop policy if exists "Users can delete their own avatar photo" on storage.objects;

-- Allow all users (authenticated and public) to read/view avatar images
create policy "Avatar photos are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Allow authenticated users to upload ONLY into their own folder (<user_id>/<filename>)
create policy "Users can upload their own avatar photo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update ONLY their own avatar files
create policy "Users can update their own avatar photo"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' and
    (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete ONLY their own avatar files
create policy "Users can delete their own avatar photo"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (select auth.uid())::text = (storage.foldername(name))[1]
  );
