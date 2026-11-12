-- Jumu'ah reminder, quiet hours and the private qaza tracker. Run once (safe to re-run).
alter table public.members
  add column if not exists notify_jumuah boolean not null default false,
  add column if not exists quiet_start int check (quiet_start between 0 and 1439),   -- minutes after local midnight
  add column if not exists quiet_end int check (quiet_end between 0 and 1439);

-- Qaza (make-up prayers): private to each person.
create table if not exists public.qaza (
  user_id uuid not null references public.members(id) on delete cascade,
  waqt text not null check (waqt in ('fajr','dhuhr','asr','maghrib','isha','witr')),
  owed int not null default 0 check (owed between 0 and 100000),
  done int not null default 0 check (done between 0 and 100000),
  updated_at timestamptz not null default now(),
  primary key (user_id, waqt)
);
alter table public.qaza enable row level security;
drop policy if exists qz_own on public.qaza;
create policy qz_own on public.qaza for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
