-- ==============================================================================
-- NOWLY: Friend Requests & User Search Migration
-- Safe, repeatable, and idempotent migration script for Supabase.
-- ==============================================================================

-- 1. Ensure `username` column exists on public.profiles
alter table public.profiles add column if not exists username text;

-- Add unique constraint on username if not already present
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_username_key'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_username_key unique (username);
  end if;
end $$;

-- Search indexes for fast display_name and username querying
create index if not exists idx_profiles_display_name_trgm on public.profiles using btree (display_name);
create index if not exists idx_profiles_username on public.profiles using btree (username);

-- 2. Create public.friend_requests table
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'canceled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint friend_requests_different_users check (sender_id != receiver_id),
  constraint friend_requests_unique_pair unique (sender_id, receiver_id)
);

-- Undirected unique index to prevent reverse-direction duplicate requests:
-- e.g., if (User A, User B) exists, (User B, User A) cannot be created.
create unique index if not exists idx_friend_requests_undirected_pair
  on public.friend_requests (
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id)
  );

-- Enable Row Level Security (RLS)
alter table public.friend_requests enable row level security;

-- 3. Row Level Security Policies for public.friend_requests

-- SELECT: Users can only view friend requests where they are either sender or receiver
drop policy if exists "Users can view their own friend requests" on public.friend_requests;
create policy "Users can view their own friend requests"
  on public.friend_requests
  for select
  to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);

-- INSERT: Authenticated users can only send requests where sender_id is themselves and receiver is different
drop policy if exists "Users can send friend requests" on public.friend_requests;
create policy "Users can send friend requests"
  on public.friend_requests
  for insert
  to authenticated
  with check ((select auth.uid()) = sender_id and sender_id != receiver_id);

-- UPDATE: Granular permissions:
-- Only RECEIVER can accept or reject an incoming request
drop policy if exists "Receivers can accept or reject friend requests" on public.friend_requests;
create policy "Receivers can accept or reject friend requests"
  on public.friend_requests
  for update
  to authenticated
  using ((select auth.uid()) = receiver_id)
  with check (
    (select auth.uid()) = receiver_id
    and status in ('accepted', 'rejected')
  );

-- Only SENDER can cancel their own pending request
drop policy if exists "Senders can cancel their pending friend requests" on public.friend_requests;
create policy "Senders can cancel their pending friend requests"
  on public.friend_requests
  for update
  to authenticated
  using ((select auth.uid()) = sender_id and status = 'pending')
  with check (
    (select auth.uid()) = sender_id
    and status = 'canceled'
  );

-- DELETE: Users can delete/clear their own completed or canceled requests
drop policy if exists "Users can delete their own friend requests" on public.friend_requests;
create policy "Users can delete their own friend requests"
  on public.friend_requests
  for delete
  to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);

-- 4. Trigger for friend_requests updated_at timestamp management
drop trigger if exists set_friend_requests_updated_at on public.friend_requests;
create trigger set_friend_requests_updated_at
  before update on public.friend_requests
  for each row execute function public.handle_profile_updated_at();
