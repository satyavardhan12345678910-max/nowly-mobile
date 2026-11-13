-- Migration: Add current activity selection to profiles
-- Tracks the companion activity chosen during onboarding and updated in-app.

alter table public.profiles
  add column if not exists current_activity text,
  add column if not exists activity_selected_at timestamptz;

comment on column public.profiles.current_activity is 'Current activity of the user companion (e.g. studying, eating, gaming)';
comment on column public.profiles.activity_selected_at is 'Timestamp when the user last selected or updated their activity';

