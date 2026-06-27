create extension if not exists pgcrypto;

create table if not exists public.question_sessions (
  id uuid primary key default gen_random_uuid(),
  public_token text not null unique,
  relationship_type text not null check (relationship_type in ('couple', 'married', 'family', 'friends')),
  question_pack_id text not null check (question_pack_id in ('light', 'honest', 'memory-future')),
  status text not null default 'waiting' check (status in ('waiting', 'completed')),
  creator_participant_id uuid,
  invitee_participant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  completed_at timestamptz,
  deleted_at timestamptz
);

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
