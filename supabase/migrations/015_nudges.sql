-- Nudges: send a friend in your group a ready-made message (no free text). Run once in SQL Editor.
create table if not exists public.nudges (
  id bigint generated always as identity primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  from_id uuid not null default auth.uid() references public.members(id) on delete cascade,
  to_id uuid not null references public.members(id) on delete cascade,
  kind text not null check (kind in ('n1','n2','n3','n4','n5','h1','h2','h3','h4','h5','r1','r2','r3','r4')),
  waqt text not null check (waqt in ('fajr','dhuhr','asr','maghrib','isha')),
  day date not null,
  reply_to bigint references public.nudges(id) on delete cascade,
  pushed boolean not null default false,
  created_at timestamptz not null default now(),
  check (from_id <> to_id)
);
-- One nudge per person, per friend, per namaz; one reply per nudge.
create unique index if not exists nudges_once on public.nudges (from_id, to_id, day, waqt) where reply_to is null;
create unique index if not exists nudges_reply_once on public.nudges (from_id, reply_to) where reply_to is not null;
create index if not exists nudges_recent on public.nudges (group_id, created_at desc);

alter table public.nudges enable row level security;
drop policy if exists nd_read on public.nudges;
create policy nd_read on public.nudges for select to authenticated using (in_group(group_id));
drop policy if exists nd_insert on public.nudges;
create policy nd_insert on public.nudges for insert to authenticated with check (
  from_id = auth.uid() and pushed = false and in_group(group_id)
  and exists (select 1 from group_members gm where gm.group_id = nudges.group_id and gm.user_id = nudges.to_id)
  and (reply_to is null or exists (select 1 from nudges n where n.id = nudges.reply_to and n.to_id = auth.uid() and n.from_id = nudges.to_id))
);
drop policy if exists nd_delete on public.nudges;
create policy nd_delete on public.nudges for delete to authenticated using (from_id = auth.uid());

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'nudges') then
    alter publication supabase_realtime add table public.nudges;
  end if;
end $$;
