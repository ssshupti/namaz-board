-- Namaz Board database. Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to run once on a fresh project.

-- Who may join: an invite list of Google emails (lower-case). Admins manage it.
create table if not exists public.invites (
  email text primary key check (email = lower(email)),
  added_at timestamptz default now()
);

-- Admins (you). Added by hand in the SQL editor, never from the app.
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

-- One row per person on the board.
create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  city text not null default 'dhaka',
  method text not null default 'Karachi',
  madhab text not null default 'hanafi' check (madhab in ('hanafi','shafi')),
  show_extras boolean not null default true,
  is_public boolean not null default true,
  notify_start boolean not null default true,
  notify_end boolean not null default true,
  joined date not null default current_date,
  created_at timestamptz default now()
);

-- One row per person, per day, per waqt. code letters: f fardh, s sunnah, n nafl, w witr,
-- and for waqt 'x' (extras): t tahajjud, i ishraq, d duha, a awwabin.
create table if not exists public.logs (
  user_id uuid not null references public.members(id) on delete cascade,
  day date not null,
  waqt text not null check (waqt in ('fajr','dhuhr','asr','maghrib','isha','x')),
  code text not null default '' check (code ~ '^[fsnwtida]*$'),
  updated_at timestamptz not null default now(),
  primary key (user_id, day, waqt)
);

-- Phone/browser push subscriptions.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.members(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Which notifications were already sent (so the every-minute job never repeats one).
create table if not exists public.notify_sent (
  user_id uuid not null references public.members(id) on delete cascade,
  day date not null,
  waqt text not null,
  kind text not null,
  sent_at timestamptz default now(),
  primary key (user_id, day, waqt, kind)
);

-- Helpers (security definer so policies can call them without exposing the tables).
create or replace function public.my_email() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = my_email())
$$;

create or replace function public.is_invited() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from invites where email = my_email()) or is_admin()
$$;

create or replace function public.is_public_member(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_public from members where id = uid), false)
$$;

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where id = auth.uid())
$$;

alter table public.invites enable row level security;
alter table public.admins enable row level security;
alter table public.members enable row level security;
alter table public.logs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notify_sent enable row level security;   -- no policies: server only

-- invites: admins manage; anyone signed in can check whether they are invited (via is_invited()).
drop policy if exists inv_admin on public.invites;
create policy inv_admin on public.invites for all to authenticated using (is_admin()) with check (is_admin());

-- admins: readable by admins only (the app asks is_admin() instead).
drop policy if exists adm_read on public.admins;
create policy adm_read on public.admins for select to authenticated using (is_admin());

-- members: you see yourself, members see public members, admin sees names; you edit only your own row, only if invited.
drop policy if exists mem_read on public.members;
create policy mem_read on public.members for select to authenticated using (id = auth.uid() or (is_member() and is_public) or is_admin());
drop policy if exists mem_insert on public.members;
create policy mem_insert on public.members for insert to authenticated with check (id = auth.uid() and is_invited());
drop policy if exists mem_update on public.members;
create policy mem_update on public.members for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists mem_delete on public.members;
create policy mem_delete on public.members for delete to authenticated using (id = auth.uid() or is_admin());

-- logs: your own, or a public member's; you write only your own.
drop policy if exists log_read on public.logs;
create policy log_read on public.logs for select to authenticated using (user_id = auth.uid() or (is_member() and is_public_member(user_id)));
drop policy if exists log_write on public.logs;
create policy log_write on public.logs for insert to authenticated with check (user_id = auth.uid());
drop policy if exists log_update on public.logs;
create policy log_update on public.logs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists log_delete on public.logs;
create policy log_delete on public.logs for delete to authenticated using (user_id = auth.uid() or is_admin());

-- push subscriptions: your own only.
drop policy if exists sub_own on public.push_subscriptions;
create policy sub_own on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Live updates for the board.
alter publication supabase_realtime add table public.members, public.logs;

-- Needed for the every-minute notification job.
create extension if not exists pg_cron;
create extension if not exists pg_net;
