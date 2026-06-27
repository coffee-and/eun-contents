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
--   2) Together Questions invite-based answer flow
--      - public.question_sessions
--      - public.question_participants
--      - public.question_answers
--
-- Not included
--   - Supabase internal event triggers such as ensure_rls / pgrst_*.
--   - Temporary SQL notes or one-off debugging queries.
--
-- Restore note
--   Run this in Supabase SQL Editor on a clean project, then add the
--   required server-only environment variables in Vercel.
-- ============================================================

-- UUID generation for primary keys and public tokens.
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
  mode text not null check (mode in ('relationship', 'couple', 'marriage')),
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
-- Together Questions: session table
-- ============================================================
-- One invite-based question flow between two participants.
-- public_token is the URL-safe invite code.
create table if not exists public.question_sessions (
  id uuid primary key default gen_random_uuid(),
  public_token text not null unique,
  relationship_type text not null check (relationship_type in ('couple', 'married', 'family', 'friends')),
  question_pack_id text not null default 'light' check (question_pack_id in ('light', 'honest', 'memory-future')),
  status text not null default 'waiting' check (status in ('waiting', 'completed')),
  creator_participant_id uuid,
  invitee_participant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  completed_at timestamptz,
  deleted_at timestamptz
);

-- ============================================================
-- Together Questions: participant table
-- ============================================================
-- Stores creator / invitee display names and hashed private access tokens.
-- Raw participant tokens must never be stored in the database.
create table if not exists public.question_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.question_sessions(id) on delete cascade,
  role text not null check (role in ('creator', 'invitee')),
  display_name text not null check (char_length(display_name) between 1 and 24),
  access_token_hash text not null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, role),
  unique (access_token_hash)
);

-- Add circular participant references after both tables exist.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'question_sessions_creator_participant_fk'
  ) then
    alter table public.question_sessions
      add constraint question_sessions_creator_participant_fk
      foreign key (creator_participant_id) references public.question_participants(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'question_sessions_invitee_participant_fk'
  ) then
    alter table public.question_sessions
      add constraint question_sessions_invitee_participant_fk
      foreign key (invitee_participant_id) references public.question_participants(id) on delete set null;
  end if;
end $$;

-- ============================================================
-- Together Questions: answer table
-- ============================================================
-- Stores one participant answer per question id.
create table if not exists public.question_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.question_sessions(id) on delete cascade,
  participant_id uuid not null references public.question_participants(id) on delete cascade,
  question_id text not null,
  answer text not null default '' check (char_length(answer) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

-- ============================================================
-- Together Questions indexes
-- ============================================================
create index if not exists question_sessions_public_token_idx
  on public.question_sessions(public_token)
  where deleted_at is null;

create index if not exists question_sessions_status_idx
  on public.question_sessions(status, expires_at)
  where deleted_at is null;

create index if not exists question_participants_session_role_idx
  on public.question_participants(session_id, role);

create index if not exists question_answers_session_participant_idx
  on public.question_answers(session_id, participant_id);

-- ============================================================
-- Together Questions updated_at triggers
-- ============================================================
drop trigger if exists question_sessions_set_updated_at on public.question_sessions;
create trigger question_sessions_set_updated_at
before update on public.question_sessions
for each row execute function public.set_updated_at();

drop trigger if exists question_participants_set_updated_at on public.question_participants;
create trigger question_participants_set_updated_at
before update on public.question_participants
for each row execute function public.set_updated_at();

drop trigger if exists question_answers_set_updated_at on public.question_answers;
create trigger question_answers_set_updated_at
before update on public.question_answers
for each row execute function public.set_updated_at();

-- ============================================================
-- Together Questions RLS policies
-- ============================================================
-- Browser clients should not read or write these tables directly.
-- The Vercel API uses SUPABASE_SECRET_KEY / service role on the server.
alter table public.question_sessions enable row level security;
alter table public.question_participants enable row level security;
alter table public.question_answers enable row level security;

drop policy if exists "question_sessions_no_client_access" on public.question_sessions;
drop policy if exists "question_participants_no_client_access" on public.question_participants;
drop policy if exists "question_answers_no_client_access" on public.question_answers;

create policy "question_sessions_no_client_access"
on public.question_sessions
for all
using (false)
with check (false);

create policy "question_participants_no_client_access"
on public.question_participants
for all
using (false)
with check (false);

create policy "question_answers_no_client_access"
on public.question_answers
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
grant all privileges on table public.question_sessions to service_role;
grant all privileges on table public.question_participants to service_role;
grant all privileges on table public.question_answers to service_role;

grant all privileges on all sequences in schema public to service_role;
