-- ============================================================
-- EUN CONTENTS Supabase Database Backup
-- ============================================================
-- Purpose
--   This file keeps the database schema needed by the current app.
--   It is meant as a human-readable backup / restore script for Supabase.
--
-- Included service areas
--   1) Relationship Analyzer saved results
--      - public.results
--
-- Not included
--   - Supabase internal event triggers such as ensure_rls / pgrst_*.
--   - Temporary SQL notes or one-off debugging queries.
--
-- Restore note
--   Run this in Supabase SQL Editor on a clean project, then add the
--   required server-only environment variables in Vercel.
-- ============================================================

-- UUID generation for primary keys.
create extension if not exists pgcrypto;

-- ============================================================
-- Shared helper: updated_at auto refresh
-- ============================================================
-- Any table with an updated_at column can use this trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Relationship Analyzer: saved result links
-- ============================================================
-- Stores the user's completed relationship analysis result so it can be
-- opened again through a saved result link.
--
-- Used by:
--   api/results.js
--   api/results/[id].js
--
-- Notes:
--   - answers, scores, analysis are JSON because the front-end sends
--     structured result data.
--   - report_status is currently "free" by default, and can later be
--     extended for paid / premium report access.
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('relationship', 'couple', 'married')),
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  result_type text,
  report_status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists results_created_at_idx
  on public.results(created_at desc)
  where deleted_at is null;

create index if not exists results_report_status_idx
  on public.results(report_status)
  where deleted_at is null;

drop trigger if exists results_set_updated_at on public.results;
create trigger results_set_updated_at
before update on public.results
for each row execute function public.set_updated_at();

-- Keep browser clients from accessing saved results directly through the
-- Supabase client. The app should use the Vercel API with service role key.
alter table public.results enable row level security;

drop policy if exists "results_no_client_access" on public.results;
create policy "results_no_client_access"
on public.results
for all
using (false)
with check (false);

-- ============================================================
-- Server role grants
-- ============================================================
-- These grants make the restore script safer if a fresh project has stricter
-- defaults. The service role key must still be kept server-side only.
grant usage on schema public to service_role;

grant all privileges on table public.results to service_role;

grant all privileges on all sequences in schema public to service_role;
